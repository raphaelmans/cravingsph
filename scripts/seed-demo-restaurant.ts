/**
 * Seed script: creates one demo restaurant with a full menu hierarchy.
 *
 * Usage:
 *   pnpm db:seed:demo
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
import { demoRestaurant } from "./seed-data/demo-restaurant";
import {
  DEFAULT_SEED_OWNER_USER_ID,
  envOrDefault,
  getSeedOwnerContext,
  requireEnv,
} from "./seed-owner";
import { seedRestaurant } from "./seed-restaurant";

async function main() {
  console.log("🌱 CravingsPH Demo Restaurant Seed\n");

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

    await seedRestaurant(db, owner.userId, demoRestaurant, {
      ownerProfile: {
        displayName: owner.displayName,
        email: owner.email,
      },
    });

    console.log("\nSeed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
