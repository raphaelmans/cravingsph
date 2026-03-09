import { and, eq, sql } from "drizzle-orm";
import { branch, restaurant, savedRestaurant } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row type returned from list query
// ---------------------------------------------------------------------------

export interface SavedRestaurantRow {
  id: string;
  restaurantId: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  logoUrl: string | null;
  cuisineType: string | null;
  branchCity: string | null;
  savedAt: Date;
  note: string | null;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface ISavedRestaurantRepository {
  findByUserId(userId: string): Promise<SavedRestaurantRow[]>;
  save(userId: string, restaurantId: string, note?: string): Promise<void>;
  unsave(userId: string, restaurantId: string): Promise<void>;
  isSaved(userId: string, restaurantId: string): Promise<boolean>;
  findPopularItems(restaurantIds: string[]): Promise<Map<string, string[]>>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SavedRestaurantRepository implements ISavedRestaurantRepository {
  constructor(private db: DbClient) {}

  async findByUserId(userId: string): Promise<SavedRestaurantRow[]> {
    const rows = await this.db
      .selectDistinctOn([savedRestaurant.id], {
        id: savedRestaurant.id,
        restaurantId: savedRestaurant.restaurantId,
        slug: restaurant.slug,
        name: restaurant.name,
        coverUrl: restaurant.coverUrl,
        logoUrl: restaurant.logoUrl,
        cuisineType: restaurant.cuisineType,
        branchCity: branch.city,
        savedAt: savedRestaurant.savedAt,
        note: savedRestaurant.note,
      })
      .from(savedRestaurant)
      .innerJoin(restaurant, eq(restaurant.id, savedRestaurant.restaurantId))
      .leftJoin(
        branch,
        and(eq(branch.restaurantId, restaurant.id), eq(branch.isActive, true)),
      )
      .where(eq(savedRestaurant.userId, userId))
      .orderBy(savedRestaurant.id, sql`${savedRestaurant.savedAt} DESC`);

    return rows;
  }

  async save(
    userId: string,
    restaurantId: string,
    note?: string,
  ): Promise<void> {
    await this.db
      .insert(savedRestaurant)
      .values({ userId, restaurantId, note: note ?? null })
      .onConflictDoNothing({
        target: [savedRestaurant.userId, savedRestaurant.restaurantId],
      });
  }

  async unsave(userId: string, restaurantId: string): Promise<void> {
    await this.db
      .delete(savedRestaurant)
      .where(
        and(
          eq(savedRestaurant.userId, userId),
          eq(savedRestaurant.restaurantId, restaurantId),
        ),
      );
  }

  async isSaved(userId: string, restaurantId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: savedRestaurant.id })
      .from(savedRestaurant)
      .where(
        and(
          eq(savedRestaurant.userId, userId),
          eq(savedRestaurant.restaurantId, restaurantId),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async findPopularItems(
    restaurantIds: string[],
  ): Promise<Map<string, string[]>> {
    if (restaurantIds.length === 0) return new Map();

    const rows = await this.db.execute<{
      restaurant_id: string;
      item_name: string;
    }>(sql`
      SELECT sub.restaurant_id, sub.item_name
      FROM (
        SELECT
          b.restaurant_id,
          mi.name AS item_name,
          ROW_NUMBER() OVER (
            PARTITION BY b.restaurant_id
            ORDER BY mi.sort_order ASC, mi.name ASC
          ) AS rn
        FROM menu_item mi
        JOIN category c ON c.id = mi.category_id
        JOIN branch b ON b.id = c.branch_id
        WHERE b.restaurant_id = ANY(${restaurantIds})
          AND mi.is_available = true
      ) sub
      WHERE sub.rn <= 3
      ORDER BY sub.restaurant_id, sub.rn
    `);

    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.restaurant_id) ?? [];
      list.push(row.item_name);
      map.set(row.restaurant_id, list);
    }
    return map;
  }
}
