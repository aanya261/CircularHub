import { neon } from "@neondatabase/serverless";

let sqlClient;
let schemaPromise;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sqlClient) {
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}

export async function ensureSchema() {
  if (!schemaPromise) {
    const sql = getSql();
    schemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS listings (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          brand TEXT NOT NULL,
          price NUMERIC(12,2) NOT NULL DEFAULT 0,
          original_price NUMERIC(12,2) NOT NULL DEFAULT 0,
          condition TEXT NOT NULL DEFAULT 'Good',
          age TEXT NOT NULL DEFAULT '1 year',
          city TEXT NOT NULL DEFAULT 'Mumbai',
          seller TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 86,
          image TEXT NOT NULL DEFAULT '',
          images JSONB NOT NULL DEFAULT '[]'::jsonb,
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          reviewed_by TEXT,
          reviewed_at TIMESTAMPTZ
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id BIGSERIAL PRIMARY KEY,
          tracking_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          fields JSONB NOT NULL DEFAULT '[]'::jsonb,
          amount NUMERIC(12,2) NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Submitted',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC)`;
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }
  return schemaPromise;
}
