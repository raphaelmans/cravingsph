"use client";

import { History, ReceiptText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { useSetPageHeader } from "@/components/layout/page-header-context";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCustomerOrders } from "../hooks/use-customer-orders";
import { OrderHistoryCard } from "./order-history-card";

export function CustomerOrdersPage() {
  useSetPageHeader({ title: "Order history", label: "Retention" });
  const router = useRouter();
  const { orders, reorderOrder } = useCustomerOrders();

  const stats = useMemo(() => {
    const completed = orders.filter(
      (order) => order.status === "completed",
    ).length;

    return {
      completed,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  }, [orders]);

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
        <section className="overflow-hidden rounded-4xl border border-primary/15 bg-linear-to-br from-primary/[0.16] via-background to-background p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                <Sparkles className="size-3.5" />
                Saved for reorder
              </p>
              <div>
                <h2 className="font-heading text-2xl font-bold">
                  Your last cravings, one tap away
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Rebuild a familiar cart and check which dishes are still live.
                </p>
              </div>
            </div>

            <div className="hidden rounded-4xl border border-primary/15 bg-background/80 p-4 sm:block">
              <ReceiptText className="size-8 text-primary" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-background/85 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Completed orders</p>
              <p className="mt-2 font-heading text-3xl font-bold">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-3xl bg-background/85 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Total tracked spend
              </p>
              <p className="mt-2 font-heading text-3xl font-bold">
                ₱{stats.totalSpent.toLocaleString("en-PH")}
              </p>
            </div>
          </div>
        </section>

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
          <Empty className="border-primary/15 bg-background">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>No orders yet</EmptyTitle>
              <EmptyDescription>
                Once you place an order while signed in, it will show up here
                for easy reorder.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild shape="pill">
                <Link href={appRoutes.index.base}>Browse restaurants</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
