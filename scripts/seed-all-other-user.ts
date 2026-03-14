/**
 * Seed script: creates a distinct copy of all demo restaurants for a second owner.
 *
 * Usage:
 *   SEED_OTHER_OWNER_USER_ID=<uuid> pnpm db:seed:all:other
 *
 * Optional:
 *   SEED_OTHER_OWNER_USER_ID   — Defaults to 2359a982-b0ca-4252-93f2-d1fcf3515d0a
 *   SEED_OTHER_OWNER_NAMESPACE=<slug-safe-token>
 *   SEED_OTHER_OWNER_LABEL=<human-readable-label>
 *
 * Requires:
 *   DATABASE_URL               — Postgres connection string
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
  DEFAULT_OTHER_SEED_OWNER_USER_ID,
  envOrDefault,
  getSeedOwnerContext,
  namespaceSeedFixtures,
  optionalEnv,
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
  console.log("🌱 CravingsPH — Seed All Restaurants For Other Owner\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = envOrDefault(
    "SEED_OTHER_OWNER_USER_ID",
    DEFAULT_OTHER_SEED_OWNER_USER_ID,
  );
  const ownerNamespace = optionalEnv("SEED_OTHER_OWNER_NAMESPACE");
  const ownerLabel = optionalEnv("SEED_OTHER_OWNER_LABEL");

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    const owner = await getSeedOwnerContext(db, ownerUserId, {
      namespace: ownerNamespace,
      label: ownerLabel,
    });

    if (!owner) {
      console.error(
        `ERROR: No auth.users row found for SEED_OTHER_OWNER_USER_ID=${ownerUserId}`,
      );
      console.error(
        "Create the owner account via Supabase Auth first, then rerun.",
      );
      process.exit(1);
    }

    const namespacedFixtures = namespaceSeedFixtures(ALL_FIXTURES, owner);

    console.log(`Owner verified: ${owner.userId}`);
    console.log(`Owner label: ${owner.label}`);
    console.log(`Seed namespace: ${owner.namespace}`);
    console.log(
      `Profile seed: ${owner.displayName ?? "Owner"} <${owner.email ?? "no-email"}>\n`,
    );

    for (const fixture of namespacedFixtures) {
      await seedRestaurant(db, owner.userId, fixture, {
        ownerProfile: {
          displayName: owner.displayName,
          email: owner.email,
        },
      });
      console.log("");
    }

    console.log(
      `Done — ${namespacedFixtures.length} restaurants seeded successfully for ${owner.label}.`,
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
