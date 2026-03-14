/**
 * Seed script: creates all demo restaurants with full menu hierarchies.
 *
 * Usage:
 *   pnpm db:seed:all
 *
 * Requires:
 *   DATABASE_URL        — Postgres connection string
 *
 * Optional:
 *   SEED_OWNER_USER_ID  — UUID of an existing auth.users row
 *                         Defaults to 68fb241f-eaa2-4292-99ea-a229ae7737f5
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";
import { cafeCebuano } from "./seed-data/cafe-cebuano";
import { cebuLechonHouse } from "./seed-data/cebu-lechon-house";
import { demoRestaurant } from "./seed-data/demo-restaurant";
import { lePetitBistro } from "./seed-data/le-petit-bistro";
import { pocheroDecebu } from "./seed-data/pochero-de-cebu";
import { sugboMercadoGrill } from "./seed-data/sugbo-mercado-grill";
import {
  DEFAULT_SEED_OWNER_USER_ID,
  envOrDefault,
  getSeedOwnerContext,
  requireEnv,
} from "./seed-owner";
import { seedRestaurant } from "./seed-restaurant";

const ALL_FIXTURES = [
  demoRestaurant,
  cebuLechonHouse,
  sugboMercadoGrill,
  cafeCebuano,
  pocheroDecebu,
  lePetitBistro,
];

async function main() {
  console.log("🌱 CravingsPH — Seed All Restaurants\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = envOrDefault(
    "SEED_OWNER_USER_ID",
    DEFAULT_SEED_OWNER_USER_ID,
  );

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    const owner = await getSeedOwnerContext(db, ownerUserId);

    if (!owner) {
      console.error(
        `ERROR: No auth.users row found for SEED_OWNER_USER_ID=${ownerUserId}`,
      );
      console.error(
        "Create the owner account via Supabase Auth first, then rerun.",
      );
      process.exit(1);
    }

    console.log(`Owner verified: ${owner.userId}`);
    console.log(
      `Profile seed: ${owner.displayName ?? "Owner"} <${owner.email ?? "no-email"}>\n`,
    );

    for (const fixture of ALL_FIXTURES) {
      await seedRestaurant(db, owner.userId, fixture, {
        ownerProfile: {
          displayName: owner.displayName,
          email: owner.email,
        },
      });
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
