/**
 * Order management types.
 *
 * These are local stub types until the order tRPC module is built.
 * Once `order.*` procedures exist, replace with `inferRouterOutputs<AppRouter>`
 * types (same pattern as menu-management/types.ts).
 */

export type { OrderType } from "@/features/checkout/components/order-type-selector";
export type { PaymentStatus } from "@/features/order-tracking/components/order-details";
// Re-export shared types from customer-facing components
export type { OrderStatus } from "@/features/order-tracking/components/order-status-tracker";

// --- Owner-facing order types ---

export interface OrderItemSummary {
  name: string;
  variantName: string | null;
  modifiers: string[];
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  branchId: string;
  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  orderType: "dine-in" | "pickup";
  customerName: string | null;
  customerPhone: string | null;
  tableNumber: string | null;
  tableSessionId: string | null;
  itemCount: number;
  totalAmount: number;
  specialInstructions: string | null;
  paymentStatus: "pending" | "submitted" | "confirmed" | "rejected";
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentScreenshotUrl: string | null;
  items: OrderItemSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  createdAt: string;
}

/** Tab values for the order dashboard */
export type OrderTab = "inbox" | "active" | "completed" | "cancelled";

/** Maps tab values to order statuses for filtering */
export const TAB_STATUS_MAP: Record<OrderTab, OrderRecord["status"][]> = {
  inbox: ["placed"],
  active: ["accepted", "preparing", "ready"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};
