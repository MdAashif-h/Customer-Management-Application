import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const globalForPg = globalThis as unknown as {
  supabasePool?: pg.Pool;
};

export function getSupabasePool(): pg.Pool {
  if (!globalForPg.supabasePool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured for Supabase connection.");
    }
    globalForPg.supabasePool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalForPg.supabasePool;
}

export async function querySupabase<T extends pg.QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getSupabasePool();
  const res = await pool.query<T>(text, params);
  return res.rows;
}

export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) throw new Error("Supabase server configuration is missing.");
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}