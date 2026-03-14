"use client";

import { Inbox } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { useBranchPortal } from "@/features/branch-portal/components/branch-portal-provider";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { OrderDashboardTabs } from "@/features/order-management/components/order-dashboard-tabs";
import {
  useAcceptOrder,
  useOrders,
  useRejectOrder,
} from "@/features/order-management/hooks/use-order-management";
import type { OrderTab } from "@/features/order-management/types";

export default function BranchPortalOrdersPage() {
  const ctx = useBranchPortal();
  const { data: orders, isLoading } = useOrders(ctx.branchId);
  const acceptMutation = useAcceptOrder(ctx.branchId);
  const rejectMutation = useRejectOrder(ctx.branchId);

  const [activeTab, setActiveTab] = useState<OrderTab>("inbox");

  const detailBaseHref = appRoutes.branchPortal.orders(ctx.portalSlug);

  const handleAccept = (orderId: string) => {
    acceptMutation.mutate(orderId);
    toast.success("Order accepted");
  };

  const handleReject = (orderId: string) => {
    rejectMutation.mutate(orderId);
    toast.info("Order rejected");
  };

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          {
            label: "Overview",
            href: appRoutes.branchPortal.byPortalSlug(ctx.portalSlug),
          },
          { label: "Orders" },
        ]}
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        <AppPageHeader
          eyebrow="Branch operations"
          title="Orders"
          description="Review new orders, move active tickets forward, and keep the branch queue clean."
          variant="compact"
        />

        <OwnerWalkthroughPanel
          flowId="owner-branch-orders"
          title="Run the branch order queue"
          description="Live operations view for every incoming order."
          steps={[
            {
              title: "Start with inbox orders",
              description:
                "New orders land here for accept or reject decisions.",
            },
            {
              title: "Use tabs to separate workload",
              description:
                "Tabs separate active, completed, and cancelled orders.",
            },
            {
              title: "Open detail pages for edge cases",
              description:
                "Open detail view for timeline, payment, or item review.",
            },
          ]}
        />

        {isLoading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          <OrdersEmptyState
            menuHref={appRoutes.branchPortal.menu(ctx.portalSlug)}
          />
        ) : (
          <OrderDashboardTabs
            orders={orders}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            detailBaseHref={detailBaseHref}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </div>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 w-80 animate-skeleton rounded-lg bg-muted" />
      <div className="h-20 animate-skeleton rounded-lg bg-muted" />
      <div className="h-20 animate-skeleton rounded-lg bg-muted" />
      <div className="h-20 animate-skeleton rounded-lg bg-muted" />
    </div>
  );
}

function OrdersEmptyState({ menuHref }: { menuHref: string }) {
  return (
    <AppEmptyState
      icon={<Inbox />}
      title="No orders yet"
      description="Orders will appear here when customers start placing them. Make sure your menu is set up and online ordering is enabled."
      primaryAction={
        <Button asChild shape="pill">
          <a href={menuHref}>Review menu</a>
        </Button>
      }
    />
  );
}
