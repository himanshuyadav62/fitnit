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
    max: process.env.NODE_ENV === "development" ? 5 : 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });

if (process.env.NODE_ENV !== "production") globalForDb.sqlClient = sqlClient;

export const db = drizzle(sqlClient, { schema });
export { sqlClient };
