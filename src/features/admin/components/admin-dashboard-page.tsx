"use client";

import { LayoutDashboard, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AdminDashboardStatCard } from "@/features/admin/components/admin-dashboard-stat-card";
import { AdminRecentActivityFeed } from "@/features/admin/components/admin-recent-activity-feed";
import { useAdminDashboardOverview } from "@/features/admin/hooks/use-admin-portal";

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboardOverview();

  return (
    <>
      <DashboardNavbar breadcrumbs={[{ label: "Admin" }]} />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Admin workspace"
          title="Platform dashboard"
          description="Monitor restaurant growth, platform activity, and the operational health of the live system."
          icon={<LayoutDashboard className="size-5" />}
          variant="compact"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminDashboardStatCard
            title="Restaurants"
            value={String(data?.totalRestaurants ?? 0)}
            description="Total restaurant records on the platform"
            icon={LayoutDashboard}
            isLoading={isLoading}
          />
          <AdminDashboardStatCard
            title="Pending Verification"
            value={String(data?.pendingVerifications ?? 0)}
            description="Submissions that still need admin review"
            icon={ShieldCheck}
            isLoading={isLoading}
          />
          <AdminDashboardStatCard
            title="Orders Today"
            value={data?.ordersToday == null ? "--" : String(data.ordersToday)}
            description={
              data?.ordersToday == null
                ? "Awaiting order backend procedures"
                : "Platform-wide orders created today"
            }
            icon={ShoppingBag}
            isLoading={isLoading}
          />
          <AdminDashboardStatCard
            title="Users"
            value={String(data?.totalUsers ?? 0)}
            description="Accounts with assigned platform roles"
            icon={Users}
            isLoading={isLoading}
          />
        </div>

        <AdminRecentActivityFeed
          items={data?.recentActivity ?? []}
          isLoading={isLoading}
        />

        <div className="rounded-3xl border border-dashed p-4 text-sm text-muted-foreground">
          Use restaurants and users to manage live records. Verification flows
          remain non-live until the dedicated admin queue is restored.
        </div>
      </div>
    </>
  );
}
