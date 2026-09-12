import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDb = globalThis as unknown as {
  sqlClient?: ReturnType<typeof postgres>;
};

const sqlClient =
  globalForDb.sqlClient ??
  postgres(connectionString, {
    // Keep each serverless instance deliberately small. A production `max` of
    // 10 multiplied across warm Vercel instances can exhaust Aiven's direct
    // Postgres connection limit and surface as an opaque RSC render error.
    max: process.env.NODE_ENV === "development" ? 3 : 2,
    prepare: false,
    idle_timeout: 5,
    connect_timeout: 15,
    connection: {
      application_name: "fitnit-web",
      idle_session_timeout: 60_000,
      idle_in_transaction_session_timeout: 30_000,
    },
  });

// Reuse the pool for every request handled by the same warm process.
globalForDb.sqlClient = sqlClient;

export const db = drizzle(sqlClient, { schema });
export { sqlClient };
