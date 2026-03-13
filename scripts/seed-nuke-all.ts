/**
 * Nuke ALL application data from the database.
 *
 * Deletes every organization (cascades to restaurants, branches, categories,
 * menu items, variants, modifiers, tables, sessions, orders, etc.),
 * then cleans up profiles, user roles, and saved restaurants.
 *
 * Does NOT touch auth.users — only application-level data.
 *
 * Usage:
 *   pnpm db:nuke:all
 */

import { sql } from "drizzle-orm";
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
  console.log("💣 CravingsPH — Nuke ALL Data\n");

  const databaseUrl = requireEnv("DATABASE_URL");
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    // Count before deleting
    const [orgCount] = await db.execute<{ count: string }>(
      sql`SELECT count(*) FROM organization`,
    );
    const [restCount] = await db.execute<{ count: string }>(
      sql`SELECT count(*) FROM restaurant`,
    );

    console.log(
      `Found: ${orgCount.count} organizations, ${restCount.count} restaurants\n`,
    );

    if (Number(orgCount.count) === 0) {
      console.log("Nothing to nuke.");
      return;
    }

    // 1. Delete all organizations (cascades everything)
    await db.delete(schema.organization);
    console.log("✓ Organizations deleted (cascaded to all child data)");

    // 2. Clean up user-level data (not cascade-linked to orgs)
    await db.delete(schema.savedRestaurant);
    console.log("✓ Saved restaurants cleared");

    await db.delete(schema.userRoles);
    console.log("✓ User roles cleared");

    await db.delete(schema.profile);
    console.log("✓ Profiles cleared");

    console.log("\n✅ All application data nuked. auth.users untouched.");
  } catch (error) {
    console.error("Nuke failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
