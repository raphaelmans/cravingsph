import { eq } from "drizzle-orm";
import {
  type InsertRestaurant,
  type RestaurantRecord,
  restaurant,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

export interface IRestaurantRepository {
  findById(id: string, ctx?: RequestContext): Promise<RestaurantRecord | null>;
  findBySlug(
    slug: string,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null>;
  findByOrganizationId(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord[]>;
  create(
    data: InsertRestaurant,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord>;
  update(
    id: string,
    data: Partial<InsertRestaurant>,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord>;
}

export class RestaurantRepository implements IRestaurantRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async findById(
    id: string,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(restaurant)
      .where(eq(restaurant.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async findBySlug(
    slug: string,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null> {
    const client = this.getClient(ctx);
    const result = await client
      .select()
      .from(restaurant)
      .where(eq(restaurant.slug, slug))
      .limit(1);

    return result[0] ?? null;
  }

  async findByOrganizationId(
    organizationId: string,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord[]> {
    const client = this.getClient(ctx);
    return client
      .select()
      .from(restaurant)
      .where(eq(restaurant.organizationId, organizationId));
  }

  async create(
    data: InsertRestaurant,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord> {
    const client = this.getClient(ctx);
    const result = await client.insert(restaurant).values(data).returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<InsertRestaurant>,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord> {
    const client = this.getClient(ctx);
    const result = await client
      .update(restaurant)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(restaurant.id, id))
      .returning();

    return result[0];
  }
}
