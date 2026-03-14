"use client";

import { History, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useSetPageHeader } from "@/components/layout/page-header-context";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { useCustomerOrders } from "../hooks/use-customer-orders";
import { OrderHistoryCard } from "./order-history-card";

export function CustomerOrdersPage() {
  useSetPageHeader({ title: "Order history", label: "Orders" });
  const router = useRouter();
  const { orders, reorderOrder } = useCustomerOrders();

  function handleReorder(orderId: string) {
    const result = reorderOrder(orderId);
    if (!result) {
      toast.error("We couldn't load that order.");
      return;
    }

    if (result.addedLineItems === 0) {
      toast.error("That order only contains unavailable items right now.");
      return;
    }

    if (result.replacedExistingCart) {
      toast.info("Your existing cart was replaced to match this restaurant.");
    }

    if (result.skippedItems.length > 0) {
      toast.warning(
        `${result.skippedItems.join(", ")} ${result.skippedItems.length > 1 ? "are" : "is"} unavailable and ${result.skippedItems.length > 1 ? "were" : "was"} skipped.`,
      );
    }

    toast.success(
      `Added ${result.addedQuantity} item${result.addedQuantity > 1 ? "s" : ""} from ${result.restaurantName}.`,
    );
    router.push(appRoutes.restaurant.bySlug(result.restaurantSlug));
  }

  return (
    <div className="min-h-dvh bg-linear-to-b from-peach via-background to-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6">
        <AppPageHeader
          title="Order history"
          description={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
          icon={<ReceiptText className="size-5" />}
        />

        {orders.length > 0 ? (
          <section className="space-y-4">
            {orders.map((order) => (
              <OrderHistoryCard
                key={order.id}
                order={order}
                onReorder={() => handleReorder(order.id)}
              />
            ))}
          </section>
        ) : (
          <AppEmptyState
            tone="warm"
            icon={<History />}
            title="No orders yet"
            description="Once you place an order while signed in, it will appear here for quick reorder and review."
            primaryAction={
              <Button asChild shape="pill">
                <Link href={appRoutes.index.base}>Browse restaurants</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
