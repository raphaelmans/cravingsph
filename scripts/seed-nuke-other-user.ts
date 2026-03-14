/**
 * Nuke all seed data owned by the alternate seeded user.
 *
 * Deletes organizations (cascades to restaurants, branches, categories,
 * menu items, variants, modifiers, tables, sessions, orders, etc.),
 * then cleans up profile and user_roles for that account.
 *
 * Usage:
 *   SEED_OTHER_OWNER_USER_ID=<uuid> pnpm db:seed:nuke:other
 *
 * Optional:
 *   SEED_OTHER_OWNER_USER_ID  — Defaults to 2359a982-b0ca-4252-93f2-d1fcf3515d0a
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";
import {
  DEFAULT_OTHER_SEED_OWNER_USER_ID,
  envOrDefault,
  getSeedOwnerContext,
  requireEnv,
} from "./seed-owner";

async function main() {
  console.log("💣 CravingsPH — Nuke Other Owner Seed Data\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = envOrDefault(
    "SEED_OTHER_OWNER_USER_ID",
    DEFAULT_OTHER_SEED_OWNER_USER_ID,
  );

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    const owner = await getSeedOwnerContext(db, ownerUserId);

    if (!owner) {
      console.error(`ERROR: No auth.users row for ${ownerUserId}`);
      process.exit(1);
    }

    console.log(`Owner: ${owner.userId}`);
    console.log(`Owner label: ${owner.label}`);
    console.log(
      `Profile seed: ${owner.displayName ?? "Owner"} <${owner.email ?? "no-email"}>\n`,
    );

    const orgs = await db
      .select({ id: schema.organization.id, name: schema.organization.name })
      .from(schema.organization)
      .where(eq(schema.organization.ownerId, owner.userId));

    if (orgs.length === 0) {
      console.log("No organizations found for this user. Nothing to nuke.");
    } else {
      console.log(`Deleting ${orgs.length} organization(s):`);
      for (const org of orgs) {
        console.log(`  - ${org.name} (${org.id})`);
      }

      await db
        .delete(schema.organization)
        .where(eq(schema.organization.ownerId, owner.userId));
      console.log("Organizations deleted (cascade clears all child data).\n");
    }

    await db
      .delete(schema.savedRestaurant)
      .where(eq(schema.savedRestaurant.userId, owner.userId));
    console.log("Saved restaurants cleared.");

    await db
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, owner.userId));
    console.log("User roles cleared.");

    await db
      .delete(schema.profile)
      .where(eq(schema.profile.userId, owner.userId));
    console.log("Profile cleared.");

    console.log("\n✅ Other-owner seed data nuked. Ready to re-seed.");
  } catch (error) {
    console.error("Nuke failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
