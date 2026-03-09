import { count, desc, eq } from "drizzle-orm";
import {
  authUsers,
  branch,
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

export interface AdminUserListItemRecord {
  id: string;
  userId: string;
  role: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  emailConfirmedAt: Date | string | null;
  lastSignInAt: Date | string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
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

export interface AdminRestaurantListItemRecord {
  id: string;
  restaurantId: string;
  name: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  cuisineType: string | null;
  phone: string | null;
  email: string | null;
  verificationStatus: RestaurantRecord["verificationStatus"];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminRestaurantDetailRecord
  extends AdminRestaurantListItemRecord {
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  branchCount: number;
}

export interface IAdminRepository {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
  getUsers(ctx?: RequestContext): Promise<AdminUserListItemRecord[]>;
  getRestaurants(
    ctx?: RequestContext,
  ): Promise<AdminRestaurantListItemRecord[]>;
  getRestaurantById(
    id: string,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord | null>;
  updateRestaurant(
    id: string,
    data: Partial<
      Pick<
        RestaurantRecord,
        | "name"
        | "description"
        | "cuisineType"
        | "phone"
        | "email"
        | "isFeatured"
        | "isActive"
      >
    >,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null>;
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

  async getUsers(ctx?: RequestContext): Promise<AdminUserListItemRecord[]> {
    const client = this.getClient(ctx);

    const rows = await client
      .select({
        id: authUsers.id,
        userId: authUsers.id,
        role: userRoles.role,
        displayName: profile.displayName,
        authEmail: authUsers.email,
        profileEmail: profile.email,
        authPhone: authUsers.phone,
        profilePhone: profile.phoneNumber,
        avatarUrl: profile.avatarUrl,
        emailConfirmedAt: authUsers.emailConfirmedAt,
        lastSignInAt: authUsers.lastSignInAt,
        createdAt: authUsers.createdAt,
        updatedAt: authUsers.updatedAt,
      })
      .from(userRoles)
      .innerJoin(authUsers, eq(authUsers.id, userRoles.userId))
      .leftJoin(profile, eq(profile.userId, authUsers.id))
      .orderBy(desc(authUsers.lastSignInAt), desc(authUsers.createdAt));

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      role: row.role,
      displayName: row.displayName,
      email: row.profileEmail ?? row.authEmail ?? null,
      phone: row.profilePhone ?? row.authPhone ?? null,
      avatarUrl: row.avatarUrl,
      emailConfirmedAt: row.emailConfirmedAt,
      lastSignInAt: row.lastSignInAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async getRestaurants(
    ctx?: RequestContext,
  ): Promise<AdminRestaurantListItemRecord[]> {
    const client = this.getClient(ctx);

    return client
      .select({
        id: restaurant.id,
        restaurantId: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        organizationId: organization.id,
        organizationName: organization.name,
        ownerId: organization.ownerId,
        ownerName: profile.displayName,
        ownerEmail: profile.email,
        cuisineType: restaurant.cuisineType,
        phone: restaurant.phone,
        email: restaurant.email,
        verificationStatus: restaurant.verificationStatus,
        isFeatured: restaurant.isFeatured,
        isActive: restaurant.isActive,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
      })
      .from(restaurant)
      .innerJoin(organization, eq(restaurant.organizationId, organization.id))
      .leftJoin(profile, eq(profile.userId, organization.ownerId))
      .orderBy(desc(restaurant.updatedAt), desc(restaurant.createdAt));
  }

  async getRestaurantById(
    id: string,
    ctx?: RequestContext,
  ): Promise<AdminRestaurantDetailRecord | null> {
    const client = this.getClient(ctx);

    const [restaurantResult, branchCountResult] = await Promise.all([
      client
        .select({
          id: restaurant.id,
          restaurantId: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          organizationId: organization.id,
          organizationName: organization.name,
          ownerId: organization.ownerId,
          ownerName: profile.displayName,
          ownerEmail: profile.email,
          cuisineType: restaurant.cuisineType,
          phone: restaurant.phone,
          email: restaurant.email,
          verificationStatus: restaurant.verificationStatus,
          isFeatured: restaurant.isFeatured,
          isActive: restaurant.isActive,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt,
          description: restaurant.description,
          logoUrl: restaurant.logoUrl,
          coverUrl: restaurant.coverUrl,
        })
        .from(restaurant)
        .innerJoin(organization, eq(restaurant.organizationId, organization.id))
        .leftJoin(profile, eq(profile.userId, organization.ownerId))
        .where(eq(restaurant.id, id))
        .limit(1),
      client
        .select({ count: count() })
        .from(branch)
        .where(eq(branch.restaurantId, id)),
    ]);

    const foundRestaurant = restaurantResult[0];
    if (!foundRestaurant) {
      return null;
    }

    return {
      ...foundRestaurant,
      branchCount: branchCountResult[0]?.count ?? 0,
    };
  }

  async updateRestaurant(
    id: string,
    data: Partial<
      Pick<
        RestaurantRecord,
        | "name"
        | "description"
        | "cuisineType"
        | "phone"
        | "email"
        | "isFeatured"
        | "isActive"
      >
    >,
    ctx?: RequestContext,
  ): Promise<RestaurantRecord | null> {
    const client = this.getClient(ctx);

    const result = await client
      .update(restaurant)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(restaurant.id, id))
      .returning();

    return result[0] ?? null;
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
