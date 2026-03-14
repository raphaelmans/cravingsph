"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { AcceptRejectActions } from "@/features/order-management/components/accept-reject-actions";
import { OrderDetail } from "@/features/order-management/components/order-detail";
import { OrderTimeline } from "@/features/order-management/components/order-timeline";
import { PaymentProofReview } from "@/features/order-management/components/payment-proof-review";
import { StatusUpdateDropdown } from "@/features/order-management/components/status-update-dropdown";
import {
  useAcceptOrder,
  useConfirmPayment,
  useOrderDetail,
  useOrderTimeline,
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
  const { data: timeline } = useOrderTimeline(orderId);

  const acceptMutation = useAcceptOrder(branchId);
  const rejectMutation = useRejectOrder(branchId);
  const statusMutation = useUpdateOrderStatus(branchId);
  const confirmPaymentMutation = useConfirmPayment(branchId);
  const rejectPaymentMutation = useRejectPayment(branchId);

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

  const handleConfirmPayment = (id: string) => {
    confirmPaymentMutation.mutate(id);
    toast.success("Payment confirmed");
  };

  const handleRejectPayment = (id: string, reason?: string) => {
    rejectPaymentMutation.mutate(id, reason);
    toast.info("Payment proof rejected");
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
        {isLoading ? (
          <OrderDetailSkeleton />
        ) : !order ? (
          <OrderNotFound ordersHref={ordersHref} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            <AppPageHeader
              variant="compact"
              backHref={ordersHref}
              eyebrow="Branch orders"
              title={`Order #${order.orderNumber}`}
              description="Review the order payload, payment proof, and timeline before moving the ticket forward."
              icon={<ArrowLeft className="size-4" />}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {order.status === "placed" && (
                    <AcceptRejectActions
                      orderId={order.id}
                      isAccepting={acceptMutation.isPending}
                      isRejecting={rejectMutation.isPending}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  )}

                  {["accepted", "preparing", "ready"].includes(
                    order.status,
                  ) && (
                    <StatusUpdateDropdown
                      orderId={order.id}
                      currentStatus={order.status}
                      isPending={statusMutation.isPending}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </div>
              }
            />

            <OwnerWalkthroughPanel
              flowId="owner-order-detail"
              title="Handle edge cases from one screen"
              description="The order detail page is where you slow down, verify payment, and make the right decision before the kitchen keeps moving."
              steps={[
                {
                  title: "Confirm the ticket status first",
                  description:
                    "Use the action controls at the top to accept the order or move it to the next operational state.",
                },
                {
                  title: "Review payment carefully",
                  description:
                    "Use the payment proof section to confirm or reject uploads without losing the rest of the order context.",
                },
                {
                  title: "Use the timeline for dispute resolution",
                  description:
                    "The timeline helps staff explain what happened when customers ask about order progress or payment issues.",
                },
              ]}
            />

            <OrderDetail order={order} />

            <PaymentProofReview
              order={order}
              isConfirming={confirmPaymentMutation.isPending}
              isRejecting={rejectPaymentMutation.isPending}
              onConfirm={handleConfirmPayment}
              onReject={handleRejectPayment}
            />

            <OrderTimeline events={timeline} />
          </div>
        )}
      </div>
    </>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="h-8 w-48 animate-skeleton rounded-md bg-muted" />
      <div className="h-64 animate-skeleton rounded-lg bg-muted" />
      <div className="h-32 animate-skeleton rounded-lg bg-muted" />
      <div className="h-48 animate-skeleton rounded-lg bg-muted" />
    </div>
  );
}

function OrderNotFound({ ordersHref }: { ordersHref: string }) {
  return (
    <AppEmptyState
      tone="subtle"
      title="Order not found"
      description="This order may have been deleted or the link is incorrect."
      primaryAction={
        <Button variant="outline" size="sm" shape="pill" asChild>
          <Link href={ordersHref}>Back to orders</Link>
        </Button>
      }
    />
  );
}
