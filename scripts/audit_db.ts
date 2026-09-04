import fs from "fs";
import path from "path";
import pg from "pg";

// parse .env.local manually
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
    const indexes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'auth' AND tablename = 'users';
    `);
    console.log("auth.users indexes:", indexes.rows);
  } catch (err: any) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
