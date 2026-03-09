/**
 * Seed script: creates one demo restaurant with a full menu hierarchy.
 *
 * Usage:
 *   pnpm db:seed:demo
 *
 * Requires:
 *   DATABASE_URL        — Postgres connection string
 *   SEED_OWNER_USER_ID  — UUID of an existing auth.users row
 */

import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/shared/infra/db/schema";
import { demoRestaurant } from "./seed-data/demo-restaurant";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type EntityName =
  | "profile"
  | "user_role"
  | "organization"
  | "restaurant"
  | "branch"
  | "category"
  | "menu_item"
  | "item_variant"
  | "modifier_group"
  | "modifier";

const counts: Record<EntityName, { created: number; skipped: number }> = {
  profile: { created: 0, skipped: 0 },
  user_role: { created: 0, skipped: 0 },
  organization: { created: 0, skipped: 0 },
  restaurant: { created: 0, skipped: 0 },
  branch: { created: 0, skipped: 0 },
  category: { created: 0, skipped: 0 },
  menu_item: { created: 0, skipped: 0 },
  item_variant: { created: 0, skipped: 0 },
  modifier_group: { created: 0, skipped: 0 },
  modifier: { created: 0, skipped: 0 },
};

function track(entity: EntityName, action: "created" | "skipped") {
  counts[entity][action]++;
}

function printSummary() {
  console.log("\n--- Seed Summary ---");
  for (const [entity, { created, skipped }] of Object.entries(counts)) {
    const label = entity.replace(/_/g, " ");
    console.log(`  ${label}: ${created} created, ${skipped} skipped`);
  }
  console.log("--------------------\n");
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 CravingsPH Demo Restaurant Seed\n");

  // 1. Validate env
  const databaseUrl = requireEnv("DATABASE_URL");
  const ownerUserId = requireEnv("SEED_OWNER_USER_ID");

  // 2. Connect
  const client = postgres(databaseUrl, { max: 1, prepare: false });
  const db = drizzle({ client, casing: "snake_case", schema });

  try {
    // 3. Verify owner exists in auth.users
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

    console.log(`Owner verified: ${ownerUserId}`);

    // 4. Ensure profile
    const existingProfile = await db.query.profile.findFirst({
      where: eq(schema.profile.userId, ownerUserId),
    });

    if (existingProfile) {
      track("profile", "skipped");
    } else {
      await db.insert(schema.profile).values({
        userId: ownerUserId,
        displayName: "Demo Owner",
        email: "owner@demo.local",
      });
      track("profile", "created");
    }

    // 5. Ensure user_role (owner)
    const existingRole = await db.query.userRoles.findFirst({
      where: eq(schema.userRoles.userId, ownerUserId),
    });

    if (existingRole) {
      track("user_role", "skipped");
    } else {
      await db.insert(schema.userRoles).values({
        userId: ownerUserId,
        role: "owner",
      });
      track("user_role", "created");
    }

    // 6. Upsert organization
    const orgData = demoRestaurant.organization;
    let existingOrg = await db.query.organization.findFirst({
      where: eq(schema.organization.slug, orgData.slug),
    });

    if (existingOrg) {
      track("organization", "skipped");
    } else {
      const [inserted] = await db
        .insert(schema.organization)
        .values({
          ownerId: ownerUserId,
          name: orgData.name,
          slug: orgData.slug,
          description: orgData.description,
        })
        .returning();
      existingOrg = inserted;
      track("organization", "created");
    }

    // 7. Upsert restaurant
    const restData = demoRestaurant.restaurant;
    let existingRest = await db.query.restaurant.findFirst({
      where: eq(schema.restaurant.slug, restData.slug),
    });

    if (existingRest) {
      track("restaurant", "skipped");
    } else {
      const [inserted] = await db
        .insert(schema.restaurant)
        .values({
          organizationId: existingOrg.id,
          name: restData.name,
          slug: restData.slug,
          description: restData.description,
          cuisineType: restData.cuisineType,
        })
        .returning();
      existingRest = inserted;
      track("restaurant", "created");
    }

    // 8. Upsert branch
    const brData = demoRestaurant.branch;
    let existingBranch = await db.query.branch.findFirst({
      where: and(
        eq(schema.branch.restaurantId, existingRest.id),
        eq(schema.branch.slug, brData.slug),
      ),
    });

    if (existingBranch) {
      track("branch", "skipped");
    } else {
      const [inserted] = await db
        .insert(schema.branch)
        .values({
          restaurantId: existingRest.id,
          name: brData.name,
          slug: brData.slug,
          city: brData.city,
          province: brData.province,
          address: brData.address,
        })
        .returning();
      existingBranch = inserted;
      track("branch", "created");
    }

    // 9. Seed categories, items, variants, modifier groups, modifiers
    for (const catData of demoRestaurant.categories) {
      let existingCat = await db.query.category.findFirst({
        where: and(
          eq(schema.category.branchId, existingBranch.id),
          eq(schema.category.name, catData.name),
        ),
      });

      if (existingCat) {
        track("category", "skipped");
      } else {
        const [inserted] = await db
          .insert(schema.category)
          .values({
            branchId: existingBranch.id,
            name: catData.name,
            sortOrder: catData.sortOrder,
          })
          .returning();
        existingCat = inserted;
        track("category", "created");
      }

      for (const itemData of catData.items) {
        let existingItem = await db.query.menuItem.findFirst({
          where: and(
            eq(schema.menuItem.categoryId, existingCat.id),
            eq(schema.menuItem.name, itemData.name),
          ),
        });

        if (existingItem) {
          track("menu_item", "skipped");
        } else {
          const [inserted] = await db
            .insert(schema.menuItem)
            .values({
              categoryId: existingCat.id,
              name: itemData.name,
              description: itemData.description,
              basePrice: itemData.basePrice,
              sortOrder: itemData.sortOrder,
              isAvailable: itemData.isAvailable ?? true,
            })
            .returning();
          existingItem = inserted;
          track("menu_item", "created");
        }

        // Variants
        if (itemData.variants) {
          for (const varData of itemData.variants) {
            const existingVar = await db.query.itemVariant.findFirst({
              where: and(
                eq(schema.itemVariant.menuItemId, existingItem.id),
                eq(schema.itemVariant.name, varData.name),
              ),
            });

            if (existingVar) {
              track("item_variant", "skipped");
            } else {
              await db.insert(schema.itemVariant).values({
                menuItemId: existingItem.id,
                name: varData.name,
                price: varData.price,
                sortOrder: varData.sortOrder,
              });
              track("item_variant", "created");
            }
          }
        }

        // Modifier groups
        if (itemData.modifierGroups) {
          for (const groupData of itemData.modifierGroups) {
            let existingGroup = await db.query.modifierGroup.findFirst({
              where: and(
                eq(schema.modifierGroup.menuItemId, existingItem.id),
                eq(schema.modifierGroup.name, groupData.name),
              ),
            });

            if (existingGroup) {
              track("modifier_group", "skipped");
            } else {
              const [inserted] = await db
                .insert(schema.modifierGroup)
                .values({
                  menuItemId: existingItem.id,
                  name: groupData.name,
                  isRequired: groupData.isRequired,
                  minSelections: groupData.minSelections,
                  maxSelections: groupData.maxSelections,
                  sortOrder: groupData.sortOrder,
                })
                .returning();
              existingGroup = inserted;
              track("modifier_group", "created");
            }

            for (const modData of groupData.modifiers) {
              const existingMod = await db.query.modifier.findFirst({
                where: and(
                  eq(schema.modifier.modifierGroupId, existingGroup.id),
                  eq(schema.modifier.name, modData.name),
                ),
              });

              if (existingMod) {
                track("modifier", "skipped");
              } else {
                await db.insert(schema.modifier).values({
                  modifierGroupId: existingGroup.id,
                  name: modData.name,
                  price: modData.price,
                  sortOrder: modData.sortOrder,
                });
                track("modifier", "created");
              }
            }
          }
        }
      }
    }

    printSummary();
    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
