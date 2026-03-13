"use client";

import { Clock3, RotateCcw, Store } from "lucide-react";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CustomerOrderRecord } from "../hooks/use-customer-orders";

interface OrderHistoryCardProps {
  order: CustomerOrderRecord;
  onReorder: () => void;
}

const STATUS_COPY = {
  completed: {
    label: "Completed",
    className: "border-success/20 bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function OrderHistoryCard({ order, onReorder }: OrderHistoryCardProps) {
  const status = STATUS_COPY[order.status];
  const previewItems = order.items.slice(0, 2);
  const extraItems = Math.max(order.items.length - previewItems.length, 0);

  return (
    <Card className="overflow-hidden border-primary/10 bg-background/95 shadow-sm">
      <CardHeader className="gap-4 border-b border-primary/10 bg-linear-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="size-4 text-primary" />
              <span>{order.branchLabel}</span>
            </div>
            <CardTitle className="font-heading text-xl">
              {order.restaurantName}
            </CardTitle>
          </div>

          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Order #{order.orderNumber}</span>
          <span aria-hidden="true">•</span>
          <span>{order.itemCount} items</span>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {formatDate(order.placedAt)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          {previewItems.map((item) => (
            <div
              key={`${order.id}-${item.menuItemId}-${item.variantId ?? "base"}`}
              className="flex items-start justify-between gap-4 rounded-2xl bg-muted/40 px-4 py-2"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {item.quantity}× {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[
                    item.variantName,
                    item.modifiers.map((modifier) => modifier.name).join(", "),
                  ]
                    .filter(Boolean)
                    .join(" • ") || "No modifiers"}
                </p>
              </div>

              <Price
                amount={item.unitPrice * item.quantity}
                className="text-sm"
              />
            </div>
          ))}

          {extraItems > 0 ? (
            <p className="text-sm text-muted-foreground">
              +{extraItems} more item{extraItems > 1 ? "s" : ""} in this order
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-dashed border-primary/20 px-4 py-2">
          <span className="text-sm text-muted-foreground">Total paid</span>
          <Price amount={order.totalAmount} className="text-base" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-primary/10 bg-muted/20 sm:flex-row">
        <Button shape="pill" className="w-full sm:flex-1" onClick={onReorder}>
          <RotateCcw className="size-4" />
          Reorder
        </Button>
      </CardFooter>
    </Card>
  );
}
