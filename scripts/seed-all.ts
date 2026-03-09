/**
 * Seed script: creates all demo restaurants with full menu hierarchies.
 *
 * Usage:
 *   pnpm db:seed:all
 *
 * Requires:
 *   DATABASE_URL        — Postgres connection string
 *   SEED_OWNER_USER_ID  — UUID of an existing auth.users row
 */

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";
import { cafeCebuano } from "./seed-data/cafe-cebuano";
import { cebuLechonHouse } from "./seed-data/cebu-lechon-house";
import { demoRestaurant } from "./seed-data/demo-restaurant";
import { pocheroDecebu } from "./seed-data/pochero-de-cebu";
import { sugboMercadoGrill } from "./seed-data/sugbo-mercado-grill";
import { seedRestaurant } from "./seed-restaurant";

const ALL_FIXTURES = [
  demoRestaurant,
  cebuLechonHouse,
  sugboMercadoGrill,
  cafeCebuano,
  pocheroDecebu,
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  console.log("🌱 CravingsPH — Seed All Restaurants\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = requireEnv("SEED_OWNER_USER_ID");

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    const [authUser] = await db.execute<{ id: string }>(
      sql`SELECT id FROM auth.users WHERE id = ${ownerUserId}`,
    );

    if (!authUser) {
      console.error(
        `ERROR: No auth.users row found for SEED_OWNER_USER_ID=${ownerUserId}`,
      );
      console.error(
        "Create the owner account via Supabase Auth first, then rerun.",
      );
      process.exit(1);
    }

    console.log(`Owner verified: ${ownerUserId}\n`);

    for (const fixture of ALL_FIXTURES) {
      await seedRestaurant(db, ownerUserId, fixture);
      console.log("");
    }

    console.log(
      `Done — ${ALL_FIXTURES.length} restaurants seeded successfully.`,
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
