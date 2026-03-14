"use client";

import { formatDistanceToNow } from "date-fns";
import { Armchair, Clock, MoreHorizontal, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderRecord } from "../types";

const STATUS_BADGE: Record<
  OrderRecord["status"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  placed: { label: "New", variant: "default" },
  accepted: { label: "Accepted", variant: "secondary" },
  preparing: { label: "Preparing", variant: "secondary" },
  ready: { label: "Ready", variant: "outline" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface OrderRowProps {
  order: OrderRecord;
  detailHref: string;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

export function OrderRow({
  order,
  detailHref,
  onAccept,
  onReject,
}: OrderRowProps) {
  const badge = STATUS_BADGE[order.status];
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      data-slot="order-row"
      className="flex items-center gap-4 rounded-3xl border border-border/70 bg-background/95 p-4 transition-colors hover:bg-muted/40 hover:shadow-sm"
    >
      {/* Order info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={detailHref}
            className="font-heading text-base font-semibold tracking-tight hover:underline"
          >
            #{order.orderNumber}
          </Link>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>

        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          {/* Order type */}
          <span className="inline-flex items-center gap-1">
            {order.orderType === "dine-in" ? (
              <Armchair className="size-3" />
            ) : (
              <ShoppingBag className="size-3" />
            )}
            <span className="capitalize">{order.orderType}</span>
            {order.orderType === "dine-in" && order.tableNumber && (
              <span>· Table {order.tableNumber}</span>
            )}
          </span>

          {/* Customer */}
          {order.customerName && <span>{order.customerName}</span>}

          {/* Time */}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Item count + total */}
      <div className="text-right shrink-0">
        <Price amount={order.totalAmount} className="text-sm font-medium" />
        <p className="text-xs text-muted-foreground">
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Actions */}
      {order.status === "placed" && onAccept && onReject && (
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => onAccept(order.id)}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(order.id)}
          >
            Reject
          </Button>
        </div>
      )}

      {order.status !== "placed" && (
        <Link href={detailHref}>
          <Button size="icon" variant="ghost" shape="pill">
            <MoreHorizontal className="size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
