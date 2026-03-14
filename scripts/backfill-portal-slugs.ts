/**
 * Backfill script: generates portal_slug for all existing branches.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/backfill-portal-slugs.ts
 *   — or —
 *   pnpm db:backfill:portal-slugs
 *
 * Safe to run multiple times — skips branches that already have a portal slug.
 * Uses collision-handling strategy: base → append city → append random suffix.
 */

import { eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";
import {
  composePortalSlug,
  generateSlug,
  randomSuffix,
} from "../src/shared/kernel/slug";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL is required");
    process.exit(1);
  }

  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    // Fetch all branches without portal slugs, joined with their restaurant slug
    const rows = await db
      .select({
        branchId: schema.branch.id,
        branchSlug: schema.branch.slug,
        city: schema.branch.city,
        restaurantSlug: schema.restaurant.slug,
      })
      .from(schema.branch)
      .innerJoin(
        schema.restaurant,
        eq(schema.branch.restaurantId, schema.restaurant.id),
      )
      .where(isNull(schema.branch.portalSlug));

    if (rows.length === 0) {
      console.log("All branches already have portal slugs. Nothing to do.");
      return;
    }

    console.log(`Found ${rows.length} branches without portal slugs.\n`);

    // Track used slugs to detect in-batch collisions
    const usedSlugs = new Set<string>();

    // Pre-populate with existing portal slugs in DB
    const existing = await db
      .select({ portalSlug: schema.branch.portalSlug })
      .from(schema.branch)
      .where(sql`${schema.branch.portalSlug} IS NOT NULL`);

    for (const row of existing) {
      if (row.portalSlug) {
        usedSlugs.add(row.portalSlug);
      }
    }

    let updated = 0;

    for (const row of rows) {
      const base = composePortalSlug(row.restaurantSlug, row.branchSlug);

      let portalSlug = base;

      if (usedSlugs.has(portalSlug)) {
        // Fallback 1: append city
        if (row.city) {
          const citySlug = generateSlug(row.city);
          if (citySlug) {
            portalSlug = `${base}-${citySlug}`;
          }
        }
      }

      if (usedSlugs.has(portalSlug)) {
        // Fallback 2: append random suffix
        portalSlug = `${base}-${randomSuffix()}`;
      }

      // Safety: if still collides (extremely unlikely), keep appending
      while (usedSlugs.has(portalSlug)) {
        portalSlug = `${base}-${randomSuffix()}`;
      }

      usedSlugs.add(portalSlug);

      await db
        .update(schema.branch)
        .set({ portalSlug })
        .where(eq(schema.branch.id, row.branchId));

      console.log(`  ${row.restaurantSlug}/${row.branchSlug} → ${portalSlug}`);
      updated++;
    }

    console.log(`\nDone. Updated ${updated} branches.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
