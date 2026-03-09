"use client";

import { Inbox } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { OrderDashboardTabs } from "@/features/order-management/components/order-dashboard-tabs";
import {
  useAcceptOrder,
  useOrders,
  useRejectOrder,
} from "@/features/order-management/hooks/use-order-management";
import type { OrderTab } from "@/features/order-management/types";

interface OrdersPageProps {
  params: Promise<{ restaurantId: string; branchId: string }>;
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { restaurantId, branchId } = use(params);
  const { data: orders, isLoading } = useOrders(branchId);
  const acceptMutation = useAcceptOrder(branchId);
  const rejectMutation = useRejectOrder(branchId);

  const [activeTab, setActiveTab] = useState<OrderTab>("inbox");

  const detailBaseHref = `/organization/restaurants/${restaurantId}/branches/${branchId}/orders`;

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
          { label: "Organization", href: "/organization" },
          { label: "Orders" },
        ]}
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        </div>

        {isLoading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          <OrdersEmptyState />
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
    <div className="space-y-3">
      <div className="h-10 w-80 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Inbox className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">No orders yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Orders will appear here when customers start placing them. Make sure
        your menu is set up and online ordering is enabled.
      </p>
    </div>
  );
}
