import { and, eq, ilike, or, sql } from "drizzle-orm";
import { branch, restaurant } from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types returned from queries
// ---------------------------------------------------------------------------

export interface DiscoveryRow {
  id: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  logoUrl: string | null;
  cuisineType: string | null;
  branchCity: string | null;
  branchProvince: string | null;
}

export interface LocationRow {
  city: string;
  province: string | null;
  count: number;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IDiscoveryRepository {
  findFeatured(limit: number): Promise<DiscoveryRow[]>;
  findNearby(
    lat: number | undefined,
    lng: number | undefined,
    limit: number,
  ): Promise<DiscoveryRow[]>;
  search(opts: {
    query?: string;
    cuisine?: string;
    city?: string;
    limit: number;
  }): Promise<DiscoveryRow[]>;
  findLocations(): Promise<LocationRow[]>;
  findPopularItems(restaurantIds: string[]): Promise<Map<string, string[]>>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class DiscoveryRepository implements IDiscoveryRepository {
  constructor(private db: DbClient) {}

  /**
   * Featured restaurants: is_featured=true AND is_active=true.
   * Joins first active branch for location metadata.
   */
  async findFeatured(limit: number): Promise<DiscoveryRow[]> {
    const rows = await this.db
      .selectDistinctOn([restaurant.id], {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        coverUrl: restaurant.coverUrl,
        logoUrl: restaurant.logoUrl,
        cuisineType: restaurant.cuisineType,
        branchCity: branch.city,
        branchProvince: branch.province,
      })
      .from(restaurant)
      .leftJoin(
        branch,
        and(eq(branch.restaurantId, restaurant.id), eq(branch.isActive, true)),
      )
      .where(
        and(eq(restaurant.isFeatured, true), eq(restaurant.isActive, true)),
      )
      .orderBy(restaurant.id)
      .limit(limit);

    return rows;
  }

  /**
   * Nearby restaurants: all active restaurants, optionally sorted by
   * Haversine distance if lat/lng provided.
   */
  async findNearby(
    lat: number | undefined,
    lng: number | undefined,
    limit: number,
  ): Promise<DiscoveryRow[]> {
    const baseQuery = this.db
      .selectDistinctOn([restaurant.id], {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        coverUrl: restaurant.coverUrl,
        logoUrl: restaurant.logoUrl,
        cuisineType: restaurant.cuisineType,
        branchCity: branch.city,
        branchProvince: branch.province,
      })
      .from(restaurant)
      .innerJoin(
        branch,
        and(eq(branch.restaurantId, restaurant.id), eq(branch.isActive, true)),
      )
      .where(eq(restaurant.isActive, true));

    if (lat !== undefined && lng !== undefined) {
      // Order by Haversine distance (km)
      const distanceExpr = sql`(
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(${lat})) * cos(radians(${branch.latitude}::double precision))
            * cos(radians(${branch.longitude}::double precision) - radians(${lng}))
            + sin(radians(${lat})) * sin(radians(${branch.latitude}::double precision))
          ))
        )
      )`;
      return baseQuery.orderBy(restaurant.id, distanceExpr).limit(limit);
    }

    // Fallback: alphabetical (DISTINCT ON requires restaurant.id first)
    return baseQuery.orderBy(restaurant.id, restaurant.name).limit(limit);
  }

  /**
   * Search restaurants by name, cuisine type, and branch city.
   */
  async search(opts: {
    query?: string;
    cuisine?: string;
    city?: string;
    limit: number;
  }): Promise<DiscoveryRow[]> {
    const conditions = [eq(restaurant.isActive, true)];

    if (opts.query) {
      const pattern = `%${opts.query}%`;
      conditions.push(
        or(
          ilike(restaurant.name, pattern),
          ilike(restaurant.cuisineType, pattern),
        )!,
      );
    }

    if (opts.cuisine) {
      conditions.push(ilike(restaurant.cuisineType, `%${opts.cuisine}%`));
    }

    if (opts.city) {
      conditions.push(ilike(branch.city, opts.city));
    }

    return this.db
      .selectDistinctOn([restaurant.id], {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        coverUrl: restaurant.coverUrl,
        logoUrl: restaurant.logoUrl,
        cuisineType: restaurant.cuisineType,
        branchCity: branch.city,
        branchProvince: branch.province,
      })
      .from(restaurant)
      .innerJoin(
        branch,
        and(eq(branch.restaurantId, restaurant.id), eq(branch.isActive, true)),
      )
      .where(and(...conditions))
      .limit(opts.limit);
  }

  /**
   * Distinct cities with active restaurants, with counts.
   */
  async findLocations(): Promise<LocationRow[]> {
    const rows = await this.db
      .select({
        city: branch.city,
        province: branch.province,
        count: sql<number>`count(distinct ${restaurant.id})`.mapWith(Number),
      })
      .from(branch)
      .innerJoin(
        restaurant,
        and(
          eq(restaurant.id, branch.restaurantId),
          eq(restaurant.isActive, true),
        ),
      )
      .where(and(eq(branch.isActive, true), sql`${branch.city} IS NOT NULL`))
      .groupBy(branch.city, branch.province)
      .orderBy(branch.city);

    return rows as LocationRow[];
  }

  /**
   * Get top 3 popular menu item names per restaurant.
   * Joins branch → category → menu_item.
   */
  async findPopularItems(
    restaurantIds: string[],
  ): Promise<Map<string, string[]>> {
    if (restaurantIds.length === 0) return new Map();

    // Use a window function to rank items per restaurant, pick top 3
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
        WHERE b.restaurant_id IN (${sql.join(
          restaurantIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        )})
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
