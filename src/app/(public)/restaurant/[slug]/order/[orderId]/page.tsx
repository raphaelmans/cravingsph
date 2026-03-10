"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  OrderDetails,
  type OrderItem,
  type PaymentStatus,
} from "@/features/order-tracking/components/order-details";
import {
  type OrderStatus,
  OrderStatusTracker,
} from "@/features/order-tracking/components/order-status-tracker";
import { PaymentSheet } from "@/features/payment/components/payment-sheet";

// --- Stub data (replaced by tRPC query + Supabase Realtime when backend exists) ---

const STUB_ORDER: {
  orderId: string;
  status: OrderStatus;
  orderType: "dine-in" | "pickup";
  tableNumber: string | null;
  customerName: string | null;
  items: OrderItem[];
  subtotal: number;
  specialInstructions: string | null;
  paymentStatus: PaymentStatus;
  restaurant: {
    name: string;
    logoUrl: string | null;
  };
  timestamps: Partial<Record<OrderStatus, string>>;
} = {
  orderId: "DEMO1234",
  status: "preparing",
  orderType: "dine-in",
  tableNumber: "5",
  customerName: null,
  items: [
    {
      name: "Chicken Adobo",
      variantName: "Large",
      modifiers: ["Extra Rice"],
      quantity: 2,
      unitPrice: 189,
    },
    {
      name: "Halo-Halo",
      variantName: null,
      modifiers: [],
      quantity: 1,
      unitPrice: 120,
    },
    {
      name: "Sinigang na Baboy",
      variantName: "Family",
      modifiers: ["Extra Sinigang Mix"],
      quantity: 1,
      unitPrice: 350,
    },
  ],
  subtotal: 848,
  specialInstructions: "No onions please",
  paymentStatus: "pending",
  restaurant: {
    name: "Kusina ni Maria",
    logoUrl: null,
  },
  timestamps: {
    placed: "2:30 PM",
    accepted: "2:32 PM",
  },
};

export default function OrderTrackingPage() {
  const params = useParams<{ slug: string; orderId: string }>();

  // Payment sheet state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleUploadPayment = useCallback(() => {
    setIsPaymentOpen(true);
  }, []);

  // TODO: Replace with tRPC query: order.status({ orderId: params.orderId })
  // TODO: Add Supabase Realtime subscription for live status updates
  const order = STUB_ORDER;

  return (
    <div data-slot="order-tracking-page" className="min-h-dvh bg-background">
      {/* Compact restaurant header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background px-4 py-2">
        <Link
          href={`/restaurant/${params.slug}`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
          <span className="sr-only">Back to menu</span>
        </Link>

        {order.restaurant.logoUrl && (
          <Image
            src={order.restaurant.logoUrl}
            alt={`${order.restaurant.name} logo`}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
        )}

        <h1 className="font-heading text-base font-bold truncate">
          {order.restaurant.name}
        </h1>
      </header>

      <div className="space-y-6 p-4">
        {/* Order status timeline */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Order Status</h2>
          <OrderStatusTracker
            currentStatus={order.status}
            timestamps={order.timestamps}
          />
        </section>

        <Separator />

        {/* Order details card */}
        <OrderDetails
          orderId={order.orderId}
          orderType={order.orderType}
          tableNumber={order.tableNumber}
          customerName={order.customerName}
          items={order.items}
          subtotal={order.subtotal}
          specialInstructions={order.specialInstructions}
          paymentStatus={order.paymentStatus}
        />

        {/* Payment action — show upload button if payment is pending or rejected */}
        {(order.paymentStatus === "pending" ||
          order.paymentStatus === "rejected") && (
          <Button
            shape="pill"
            size="lg"
            className="w-full"
            onClick={handleUploadPayment}
          >
            <Upload className="mr-2 size-4" />
            Upload Payment Proof
          </Button>
        )}
      </div>

      {/* Payment sheet */}
      <PaymentSheet
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        orderType={order.orderType}
        orderId={order.orderId}
      />
    </div>
  );
}
