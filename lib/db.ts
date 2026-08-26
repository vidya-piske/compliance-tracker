import { Pool } from "pg";

const connectionString = (process.env.DATABASE_URL || "").replace(/[?&]sslmode=require/, "");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query(sql: string, params?: unknown[]) {
  const result = await pool.query(sql, params);
  return result.rows;
}