import fs from "fs";
import path from "path";
import pg from "pg";

function loadEnv() {
  for (const envFile of [".env", ".env.local"]) {
    const full = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Checking Supabase tables...");

    const profilesCount = await pool.query("SELECT COUNT(*)::int AS count FROM public.profiles");
    console.log("Current profiles count:", profilesCount.rows[0].count);

    if (profilesCount.rows[0].count === 0) {
      console.log("Seeding initial auth.users and profiles...");
      const usersToSeed = [
        { name: "Jamie Sullivan", email: "jamie@custora.local", role: "ADMIN" },
        { name: "Elena Rostova", email: "elena@custora.local", role: "MANAGER" },
        { name: "Marcus Chen", email: "marcus@custora.local", role: "USER" },
        { name: "Sarah Jenkins", email: "sarah@custora.local", role: "USER" },
        { name: "Custora Demo", email: "demo@custora.local", role: "ADMIN" },
      ];

      for (const u of usersToSeed) {
        // Check existing auth.users
        const existing = await pool.query<{ id: string }>(
          "SELECT id FROM auth.users WHERE lower(email) = lower($1) LIMIT 1",
          [u.email]
        );
        let userId = existing.rows[0]?.id;

        if (!userId) {
          const authUserRes = await pool.query<{ id: string }>(
            `INSERT INTO auth.users (id, email, aud, role, is_sso_user, is_anonymous)
             VALUES (gen_random_uuid(), $1, 'authenticated', 'authenticated', false, false)
             RETURNING id`,
            [u.email]
          );
          userId = authUserRes.rows[0]?.id;
        }

        if (userId) {
          await pool.query(
            `INSERT INTO public.profiles (id, name, email, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
            [userId, u.name, u.email, u.role]
          );
        }
      }
      console.log("Profiles seeded successfully!");
    }

    // Get an admin profile id for created_by
    const adminRes = await pool.query<{ id: string }>(
      "SELECT id FROM public.profiles WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1"
    );
    const adminId = adminRes.rows[0]?.id;

    const customersCount = await pool.query("SELECT COUNT(*)::int AS count FROM public.customers");
    console.log("Current customers count:", customersCount.rows[0].count);

    if (customersCount.rows[0].count === 0 && adminId) {
      console.log("Seeding initial customers...");
      const sampleCustomers = [
        { name: "Apex Technologies", company: "Apex Corp", email: "contact@apex.io", status: "ACTIVE", location: "San Francisco, CA", phone: "+1 415-555-0101", job_title: "VP Operations", daysAgo: 60 },
        { name: "Beacon Health", company: "Beacon Health Systems", email: "info@beaconhealth.com", status: "ACTIVE", location: "Boston, MA", phone: "+1 617-555-0142", job_title: "Director IT", daysAgo: 45 },
        { name: "CloudScale Systems", company: "CloudScale Inc", email: "partners@cloudscale.net", status: "ACTIVE", location: "Seattle, WA", phone: "+1 206-555-0193", job_title: "Chief Architect", daysAgo: 30 },
        { name: "Delta Global Logistics", company: "Delta Logistics", email: "ops@deltalogistics.com", status: "INACTIVE", location: "Chicago, IL", phone: "+1 312-555-0177", job_title: "Supply Chain Lead", daysAgo: 20 },
        { name: "Echo Media Labs", company: "Echo Media", email: "team@echomedia.co", status: "ACTIVE", location: "Austin, TX", phone: "+1 512-555-0129", job_title: "Creative Director", daysAgo: 10 },
        { name: "Fortress Financial", company: "Fortress Capital", email: "advisory@fortresscap.com", status: "ACTIVE", location: "New York, NY", phone: "+1 212-555-0188", job_title: "Managing Partner", daysAgo: 5 },
        { name: "GigaByte Solutions", company: "GigaByte Labs", email: "support@gigabyte.dev", status: "ACTIVE", location: "Denver, CO", phone: "+1 303-555-0134", job_title: "Engineering Manager", daysAgo: 2 },
      ];

      for (const c of sampleCustomers) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - c.daysAgo);

        const res = await pool.query<{ id: string }>(
          `INSERT INTO public.customers (name, company, email, status, location, phone, job_title, preferred_contact, created_by, updated_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'Email', $8, $8, $9, $9)
           RETURNING id`,
          [c.name, c.company, c.email, c.status, c.location, c.phone, c.job_title, adminId, createdAt.toISOString()]
        );

        // Record customer created activity
        await pool.query(
          `INSERT INTO public.activities (actor_user_id, action, entity_type, entity_id, customer_id, created_at)
           VALUES ($1, 'Customer created', 'customer', $2, $2, $3)`,
          [adminId, res.rows[0].id, createdAt.toISOString()]
        );
      }
      console.log("Customers and activities seeded!");
    }

    const finalProfiles = await pool.query("SELECT id, name, email, role FROM public.profiles");
    console.log("Final profiles in Supabase:", finalProfiles.rows);

    const finalCustomers = await pool.query("SELECT id, name, company, status FROM public.customers");
    console.log("Final customers count:", finalCustomers.rowCount);

    const finalActivities = await pool.query("SELECT id, action, entity_type FROM public.activities");
    console.log("Final activities count:", finalActivities.rowCount);

    console.log("Seed and verify SUCCESS!");
  } catch (err: any) {
    console.error("Seed error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
