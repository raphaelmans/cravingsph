/**
 * Reusable seed logic: creates one restaurant with its full menu hierarchy.
 *
 * Extracted from seed-demo-restaurant.ts so multiple fixtures can share
 * the same idempotent insert logic.
 */

import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../src/shared/infra/db/schema";
import type { DemoSeed } from "./seed-data/demo-restaurant";

type DB = PostgresJsDatabase<typeof schema>;

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
  | "modifier"
  | "branch_table"
  | "table_session";

function createTracker() {
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
    branch_table: { created: 0, skipped: 0 },
    table_session: { created: 0, skipped: 0 },
  };

  return {
    track(entity: EntityName, action: "created" | "skipped") {
      counts[entity][action]++;
    },
    print() {
      console.log("--- Seed Summary ---");
      for (const [entity, { created, skipped }] of Object.entries(counts)) {
        const label = entity.replace(/_/g, " ");
        console.log(`  ${label}: ${created} created, ${skipped} skipped`);
      }
      console.log("--------------------");
    },
  };
}

export async function seedRestaurant(
  db: DB,
  ownerUserId: string,
  fixture: DemoSeed,
) {
  const { track, print } = createTracker();

  console.log(`Seeding: ${fixture.restaurant.name}`);

  // 1. Ensure profile
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

  // 2. Ensure user_role (owner)
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

  // 3. Upsert organization
  const orgData = fixture.organization;
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

  // 4. Upsert restaurant
  const restData = fixture.restaurant;
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
        isFeatured: restData.isFeatured ?? false,
      })
      .returning();
    existingRest = inserted;
    track("restaurant", "created");
  }

  // 5. Upsert branch
  const brData = fixture.branch;
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
        latitude: brData.latitude,
        longitude: brData.longitude,
      })
      .returning();
    existingBranch = inserted;
    track("branch", "created");
  }

  // 6. Seed categories, items, variants, modifier groups, modifiers
  for (const catData of fixture.categories) {
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

  // 7. Seed branch tables
  if (fixture.tables) {
    for (const tableData of fixture.tables) {
      const existingTable = await db.query.branchTable.findFirst({
        where: and(
          eq(schema.branchTable.branchId, existingBranch.id),
          eq(schema.branchTable.code, tableData.code),
        ),
      });

      if (existingTable) {
        track("branch_table", "skipped");
      } else {
        await db.insert(schema.branchTable).values({
          branchId: existingBranch.id,
          label: tableData.label,
          code: tableData.code,
          isActive: tableData.isActive ?? true,
          sortOrder: tableData.sortOrder,
        });
        track("branch_table", "created");
      }
    }
  }

  // 8. Seed table sessions
  if (fixture.tableSessions) {
    for (const sessionData of fixture.tableSessions) {
      const table = await db.query.branchTable.findFirst({
        where: and(
          eq(schema.branchTable.branchId, existingBranch.id),
          eq(schema.branchTable.code, sessionData.tableCode),
        ),
      });

      if (!table) {
        console.warn(
          `  WARN: table code "${sessionData.tableCode}" not found — skipping session`,
        );
        continue;
      }

      const existingSession = await db.query.tableSession.findFirst({
        where: and(
          eq(schema.tableSession.branchTableId, table.id),
          eq(schema.tableSession.status, sessionData.status),
        ),
      });

      if (existingSession) {
        track("table_session", "skipped");
      } else {
        await db.insert(schema.tableSession).values({
          branchTableId: table.id,
          status: sessionData.status,
          openedBy: ownerUserId,
          note: sessionData.note,
        });
        track("table_session", "created");
      }
    }
  }

  print();
}
