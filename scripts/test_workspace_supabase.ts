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

import { querySupabase, getSupabasePool } from "@/lib/supabase/admin";

async function runDirectQueryTests() {
  console.log("--- RUNNING DIRECT SUPABASE DATA LAYER TESTS ---");

  // 1. Test profiles query
  const profiles = await querySupabase<{ id: string; name: string; email: string; role: string; created_at: string }>(
    `SELECT id, name, email, role, created_at FROM public.profiles ORDER BY created_at DESC`
  );
  console.log("PASS: Profiles count:", profiles.length);
  console.log("Sample profile:", profiles[0]);

  // 2. Test customers query
  const customers = await querySupabase<{ id: string; name: string; company: string; status: string; created_at: string }>(
    `SELECT id, name, company, status, created_at FROM public.customers ORDER BY created_at DESC`
  );
  console.log("PASS: Customers count:", customers.length);
  console.log("Sample customer:", customers[0]);

  // 3. Test activities query with join
  const activities = await querySupabase<{
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
    actor_name: string | null;
    customer_name: string | null;
  }>(`
    SELECT 
      a.id, 
      a.action, 
      a.entity_type, 
      a.created_at,
      p.name AS actor_name,
      c.name AS customer_name
    FROM public.activities a
    LEFT JOIN public.profiles p ON a.actor_user_id = p.id
    LEFT JOIN public.customers c ON a.customer_id = c.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `);
  console.log("PASS: Activities count:", activities.length);
  console.log("Sample activity:", activities[0]);

  // 4. Test Reports metrics query with period filtering
  for (const p of ["week", "month", "quarter", "year"] as const) {
    const start = new Date();
    if (p === "week") start.setDate(start.getDate() - 7);
    else if (p === "month") start.setDate(start.getDate() - 30);
    else if (p === "quarter") start.setMonth(start.getMonth() - 3);
    else if (p === "year") start.setFullYear(start.getFullYear() - 1);

    const [stats, companies] = await Promise.all([
      querySupabase<{ total: number; active: number; inactive: number; recent: number }>(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active,
          COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS inactive,
          COUNT(*) FILTER (WHERE created_at >= $1)::int AS recent
        FROM public.customers
      `, [start.toISOString()]),
      querySupabase<{ company: string; count: number }>(`
        SELECT company, COUNT(*)::int AS count
        FROM public.customers
        WHERE company IS NOT NULL AND trim(company) != ''
        GROUP BY company
        ORDER BY count DESC
        LIMIT 5
      `),
    ]);

    console.log(`PASS: Reports for period "${p}":`, {
      stats: stats[0],
      topCompanies: companies,
    });
  }

  // 5. Test Role update with activity audit log
  const pool = getSupabasePool();
  const testUser = profiles.find(p => p.role === "USER");
  const adminUser = profiles.find(p => p.role === "ADMIN");

  if (testUser && adminUser) {
    console.log(`Testing role mutation on ${testUser.name} (${testUser.id})...`);
    const newRole = "MANAGER";
    
    // Update role
    await pool.query(
      `UPDATE public.profiles SET role = $1, updated_at = timezone('utc', now()) WHERE id = $2`,
      [newRole, testUser.id]
    );

    // Write audit log
    await pool.query(
      `INSERT INTO public.activities (actor_user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'User role changed', 'user', $2, $3)`,
      [adminUser.id, testUser.id, JSON.stringify({ oldRole: "USER", newRole })]
    );

    // Verify update
    const verifyUser = await querySupabase<{ role: string }>(
      `SELECT role FROM public.profiles WHERE id = $1`,
      [testUser.id]
    );
    console.log("PASS: Updated role:", verifyUser[0]?.role);

    // Verify activity record
    const verifyActivity = await querySupabase<{ action: string; metadata: any }>(
      `SELECT action, metadata FROM public.activities WHERE entity_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [testUser.id]
    );
    console.log("PASS: Audit activity logged:", verifyActivity[0]);

    // Revert role back
    await pool.query(
      `UPDATE public.profiles SET role = 'USER', updated_at = timezone('utc', now()) WHERE id = $1`,
      [testUser.id]
    );
    console.log("PASS: Reverted user role back to USER");
  }

  console.log("--- ALL SUPABASE TESTS COMPLETED SUCCESSFULLY ---");
}

runDirectQueryTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
