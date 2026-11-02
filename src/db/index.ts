import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const databaseReady = Boolean(databaseUrl);

export const pool = databaseUrl
  ? globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      })
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

const noopDb = {
  execute: async () => undefined,
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => [],
      }),
    }),
  }),
  insert: () => ({
    values: () => ({
      onConflictDoNothing: async () => undefined,
      onConflictDoUpdate: async () => undefined,
    }),
  }),
} as any;

export const db = databaseUrl ? drizzle(pool!) : noopDb;
