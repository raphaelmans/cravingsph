import { count, desc, eq } from "drizzle-orm";
import {
  organization,
  profile,
  type RestaurantRecord,
  restaurant,
  userRoles,
} from "@/shared/infra/db/schema";
import type { DbClient, DrizzleTransaction } from "@/shared/infra/db/types";
import type { RequestContext } from "@/shared/kernel/context";

export interface AdminRecentActivityRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  organizationName: string;
  verificationStatus: RestaurantRecord["verificationStatus"];
  isActive: boolean;
  createdAt: Date;
}

export interface AdminDashboardOverviewRecord {
  totalRestaurants: number;
  pendingVerifications: number;
  totalUsers: number;
  ordersToday: number | null;
  recentActivity: AdminRecentActivityRecord[];
}

export interface AdminVerificationQueueItemRecord {
  requestId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  organizationId: string;
  organizationName: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  restaurantPhone: string | null;
  restaurantEmail: string | null;
  verificationStatus: RestaurantRecord["verificationStatus"];
  submittedAt: Date | string;
  createdAt: Date | string;
}

export interface AdminVerificationRequestRecord
  extends AdminVerificationQueueItemRecord {
  cuisineType: string | null;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  updatedAt: Date | string;
}

export interface IAdminRepository {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
  getVerificationQueue(
    ctx?: RequestContext,
  ): Promise<AdminVerificationQueueItemRecord[]>;
  getVerificationRequestById(
    requestId: string,
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord | null>;
  updateVerificationStatus(
    requestId: string,
    status: RestaurantRecord["verificationStatus"],
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null>;
}

export class AdminRepository implements IAdminRepository {
  constructor(private db: DbClient) {}

  private getClient(ctx?: RequestContext): DbClient | DrizzleTransaction {
    return (ctx?.tx as DrizzleTransaction) ?? this.db;
  }

  async getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord> {
    const client = this.getClient(ctx);

    const [
      restaurantCountResult,
      pendingVerificationResult,
      userCountResult,
      recentActivity,
    ] = await Promise.all([
      client.select({ count: count() }).from(restaurant),
      client
        .select({ count: count() })
        .from(restaurant)
        .where(eq(restaurant.verificationStatus, "pending")),
      client.select({ count: count() }).from(userRoles),
      client
        .select({
          id: restaurant.id,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          organizationName: organization.name,
          verificationStatus: restaurant.verificationStatus,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt,
        })
        .from(restaurant)
        .innerJoin(organization, eq(restaurant.organizationId, organization.id))
        .orderBy(desc(restaurant.createdAt))
        .limit(5),
    ]);

    return {
      totalRestaurants: restaurantCountResult[0]?.count ?? 0,
      pendingVerifications: pendingVerificationResult[0]?.count ?? 0,
      totalUsers: userCountResult[0]?.count ?? 0,
      ordersToday: null,
      recentActivity,
    };
  }

  async getVerificationQueue(
    ctx?: RequestContext,
  ): Promise<AdminVerificationQueueItemRecord[]> {
    const client = this.getClient(ctx);

    return client
      .select({
        requestId: restaurant.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        organizationId: organization.id,
        organizationName: organization.name,
        ownerId: organization.ownerId,
        ownerName: profile.displayName,
        ownerEmail: profile.email,
        ownerPhone: profile.phoneNumber,
        restaurantPhone: restaurant.phone,
        restaurantEmail: restaurant.email,
        verificationStatus: restaurant.verificationStatus,
        submittedAt: restaurant.updatedAt,
        createdAt: restaurant.createdAt,
      })
      .from(restaurant)
      .innerJoin(organization, eq(restaurant.organizationId, organization.id))
      .leftJoin(profile, eq(profile.userId, organization.ownerId))
      .where(eq(restaurant.verificationStatus, "pending"))
      .orderBy(desc(restaurant.updatedAt));
  }

  async getVerificationRequestById(
    requestId: string,
    ctx?: RequestContext,
  ): Promise<AdminVerificationRequestRecord | null> {
    const client = this.getClient(ctx);

    const result = await client
      .select({
        requestId: restaurant.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        organizationId: organization.id,
        organizationName: organization.name,
        ownerId: organization.ownerId,
        ownerName: profile.displayName,
        ownerEmail: profile.email,
        ownerPhone: profile.phoneNumber,
        restaurantPhone: restaurant.phone,
        restaurantEmail: restaurant.email,
        verificationStatus: restaurant.verificationStatus,
        submittedAt: restaurant.updatedAt,
        createdAt: restaurant.createdAt,
        cuisineType: restaurant.cuisineType,
        description: restaurant.description,
        logoUrl: restaurant.logoUrl,
        coverUrl: restaurant.coverUrl,
        isActive: restaurant.isActive,
        updatedAt: restaurant.updatedAt,
      })
      .from(restaurant)
      .innerJoin(organization, eq(restaurant.organizationId, organization.id))
      .leftJoin(profile, eq(profile.userId, organization.ownerId))
      .where(eq(restaurant.id, requestId))
      .limit(1);

    return result[0] ?? null;
  }

  async updateVerificationStatus(
    requestId: string,
    status: RestaurantRecord["verificationStatus"],
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null> {
    const client = this.getClient(ctx);

    const result = await client
      .update(restaurant)
      .set({
        verificationStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(restaurant.id, requestId))
      .returning();

    return result[0] ?? null;
  }
}
