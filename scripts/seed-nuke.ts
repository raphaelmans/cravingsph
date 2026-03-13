/**
 * Nuke all seed data owned by a user.
 *
 * Deletes organizations (cascades to restaurants, branches, categories,
 * menu items, variants, modifiers, tables, sessions, orders, etc.),
 * then cleans up profile and user_roles.
 *
 * Usage:
 *   SEED_OWNER_USER_ID=<uuid> pnpm db:seed:nuke
 */

import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  console.log("💣 CravingsPH — Nuke Seed Data\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = requireEnv("SEED_OWNER_USER_ID");

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    // Verify user exists
    const [authUser] = await db.execute<{ id: string }>(
      sql`SELECT id FROM auth.users WHERE id = ${ownerUserId}`,
    );

    if (!authUser) {
      console.error(`ERROR: No auth.users row for ${ownerUserId}`);
      process.exit(1);
    }

    console.log(`Owner: ${ownerUserId}\n`);

    // 1. Delete organizations (cascades to restaurants → branches → categories → items → variants/modifiers/tables/sessions/orders)
    const orgs = await db
      .select({ id: schema.organization.id, name: schema.organization.name })
      .from(schema.organization)
      .where(eq(schema.organization.ownerId, ownerUserId));

    if (orgs.length === 0) {
      console.log("No organizations found for this user. Nothing to nuke.");
    } else {
      console.log(`Deleting ${orgs.length} organization(s):`);
      for (const org of orgs) {
        console.log(`  - ${org.name} (${org.id})`);
      }

      await db
        .delete(schema.organization)
        .where(eq(schema.organization.ownerId, ownerUserId));
      console.log(`Organizations deleted (cascade clears all child data).\n`);
    }

    // 2. Delete saved restaurants
    await db
      .delete(schema.savedRestaurant)
      .where(eq(schema.savedRestaurant.userId, ownerUserId));
    console.log("Saved restaurants cleared.");

    // 3. Delete user roles
    await db
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, ownerUserId));
    console.log("User roles cleared.");

    // 4. Delete profile
    await db
      .delete(schema.profile)
      .where(eq(schema.profile.userId, ownerUserId));
    console.log("Profile cleared.");

    console.log("\n✅ All seed data nuked. Ready to re-seed.");
  } catch (error) {
    console.error("Nuke failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
