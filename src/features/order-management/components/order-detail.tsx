"use client";

import { formatDistanceToNow } from "date-fns";
import { Armchair, Clock, Phone, ShoppingBag, User } from "lucide-react";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const PAYMENT_BADGE: Record<
  OrderRecord["paymentStatus"],
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", variant: "outline" },
  submitted: { label: "Submitted", variant: "default" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

interface OrderDetailProps {
  order: OrderRecord;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const statusBadge = STATUS_BADGE[order.status];
  const paymentBadge = PAYMENT_BADGE[order.paymentStatus];
  const timeAgo = formatDistanceToNow(new Date(order.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/10 bg-background/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="font-heading text-xl font-semibold tracking-tight">
                Order #{order.orderNumber}
              </CardTitle>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {timeAgo}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2">
              {order.orderType === "dine-in" ? (
                <Armchair className="size-4 text-muted-foreground" />
              ) : (
                <ShoppingBag className="size-4 text-muted-foreground" />
              )}
              <span className="capitalize">{order.orderType}</span>
              {order.orderType === "dine-in" && order.tableNumber && (
                <span className="text-muted-foreground">
                  · Table {order.tableNumber}
                </span>
              )}
            </span>

            {order.customerName && (
              <span className="inline-flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                {order.customerName}
              </span>
            )}

            {order.customerPhone && (
              <span className="inline-flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                {order.customerPhone}
              </span>
            )}
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              Items
            </h3>
            {order.items.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-start justify-between gap-4 rounded-2xl bg-muted/30 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {item.quantity}× {item.name}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground">
                      {item.variantName}
                    </p>
                  )}
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {item.modifiers.join(", ")}
                    </p>
                  )}
                </div>
                <Price
                  amount={item.unitPrice * item.quantity}
                  className="text-sm shrink-0"
                />
              </div>
            ))}
          </div>

          {/* Special instructions */}
          {order.specialInstructions && (
            <>
              <Separator />
              <div>
                <h3 className="mb-1 font-heading text-lg font-semibold tracking-tight">
                  Special Instructions
                </h3>
                <p className="rounded-3xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {order.specialInstructions}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-primary/20 px-4 py-3">
            <span className="text-sm font-medium">Total</span>
            <Price amount={order.totalAmount} className="text-base" />
          </div>
        </CardContent>
      </Card>

      {/* Payment info */}
      <Card className="border-primary/10 bg-background/95 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg font-semibold tracking-tight">
              Payment
            </CardTitle>
            <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          )}
          {order.paymentReference && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">
                {order.paymentReference}
              </span>
            </div>
          )}
          {order.paymentScreenshotUrl && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proof</span>
              <a
                href={order.paymentScreenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View screenshot
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
