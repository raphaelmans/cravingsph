import { count, desc, eq } from "drizzle-orm";
import {
  organization,
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

export interface IAdminRepository {
  getDashboardOverview(
    ctx?: RequestContext,
  ): Promise<AdminDashboardOverviewRecord>;
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
}
