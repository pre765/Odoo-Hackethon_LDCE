import { Pool, type PoolConfig, type QueryResultRow } from "pg";

const usesSsl = process.env.DATABASE_SSL === "true";
const connectionString = process.env.DATABASE_URL;

const databaseConfig: PoolConfig = connectionString
  ? {
      connectionString,
      ...(usesSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    }
  : {
      host: process.env.PGHOST ?? "localhost",
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE ?? "globetrotter",
      user: process.env.PGUSER ?? "postgres",
      password: process.env.PGPASSWORD,
      ...(usesSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };

/** Shared PostgreSQL connection pool. It is intentionally lazy: no schema is created here. */
export const database = new Pool(databaseConfig);

export function query<Row extends QueryResultRow>(text: string, values: unknown[] = []) {
  return database.query<Row>(text, values);
}

export function closeDatabase() {
  return database.end();
}
