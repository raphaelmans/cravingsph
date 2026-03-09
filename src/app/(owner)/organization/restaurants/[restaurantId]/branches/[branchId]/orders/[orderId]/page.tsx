"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { AcceptRejectActions } from "@/features/order-management/components/accept-reject-actions";
import { OrderDetail } from "@/features/order-management/components/order-detail";
import { StatusUpdateDropdown } from "@/features/order-management/components/status-update-dropdown";
import {
  useAcceptOrder,
  useConfirmPayment,
  useOrderDetail,
  useRejectOrder,
  useRejectPayment,
  useUpdateOrderStatus,
} from "@/features/order-management/hooks/use-order-management";

interface OrderDetailPageProps {
  params: Promise<{
    restaurantId: string;
    branchId: string;
    orderId: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { restaurantId, branchId, orderId } = use(params);
  const { data: order, isLoading } = useOrderDetail(orderId);

  const acceptMutation = useAcceptOrder(branchId);
  const rejectMutation = useRejectOrder(branchId);
  const statusMutation = useUpdateOrderStatus(branchId);
  const confirmPaymentMutation = useConfirmPayment(branchId);
  const rejectPaymentMutation = useRejectPayment(branchId);

  // Suppress unused variable warnings for payment mutations (wired in Step 12c)
  void confirmPaymentMutation;
  void rejectPaymentMutation;

  const ordersHref = `/organization/restaurants/${restaurantId}/branches/${branchId}/orders`;

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
    toast.success("Order accepted");
  };

  const handleReject = (id: string, reason?: string) => {
    rejectMutation.mutate(id, reason);
    toast.info("Order rejected");
  };

  const handleStatusChange = (
    id: string,
    newStatus: Parameters<typeof statusMutation.mutate>[1],
  ) => {
    statusMutation.mutate(id, newStatus);
    toast.success("Order status updated");
  };

  return (
    <>
      <DashboardNavbar
        breadcrumbs={[
          { label: "Organization", href: "/organization" },
          { label: "Orders", href: ordersHref },
          { label: order ? `#${order.orderNumber}` : "Order" },
        ]}
      />

      <div className="flex-1 space-y-4 p-4 md:p-6">
        {/* Back link */}
        <Link href={ordersHref}>
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="mr-1 size-4" />
            Back to orders
          </Button>
        </Link>

        {isLoading ? (
          <OrderDetailSkeleton />
        ) : !order ? (
          <OrderNotFound ordersHref={ordersHref} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                Order #{order.orderNumber}
              </h1>

              <div className="flex items-center gap-2">
                {order.status === "placed" && (
                  <AcceptRejectActions
                    orderId={order.id}
                    isAccepting={acceptMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                )}

                {["accepted", "preparing", "ready"].includes(order.status) && (
                  <StatusUpdateDropdown
                    orderId={order.id}
                    currentStatus={order.status}
                    isPending={statusMutation.isPending}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </div>

            {/* Order detail card */}
            <OrderDetail order={order} />

            {/* Placeholder for Step 12c: PaymentProofReview + OrderTimeline */}
          </div>
        )}
      </div>
    </>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function OrderNotFound({ ordersHref }: { ordersHref: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-lg font-semibold">Order not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This order may have been deleted or the link is incorrect.
      </p>
      <Link href={ordersHref} className="mt-4">
        <Button variant="outline" size="sm">
          Back to orders
        </Button>
      </Link>
    </div>
  );
}
