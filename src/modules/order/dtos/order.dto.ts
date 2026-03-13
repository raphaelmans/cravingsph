import { z } from "zod";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const OrderItemInputSchema = z.object({
  menuItemId: z.string().uuid(),
  itemVariantId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z.number().min(0),
  modifiers: z
    .array(z.object({ name: z.string(), price: z.number() }))
    .optional()
    .default([]),
});

export const CreateOrderInputSchema = z.object({
  branchId: z.string().uuid(),
  orderType: z.enum(["dine-in", "pickup"]),
  customerName: z.string().max(200).nullable().optional(),
  customerPhone: z.string().max(20).nullable().optional(),
  tableNumber: z.string().max(20).nullable().optional(),
  tableSessionId: z.string().uuid().nullable().optional(),
  specialInstructions: z.string().max(2000).nullable().optional(),
  paymentMethod: z.string().max(50).nullable().optional(),
  items: z.array(OrderItemInputSchema).min(1),
});

export const ListByBranchInputSchema = z.object({
  branchId: z.string().uuid(),
  status: z
    .enum([
      "placed",
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ])
    .optional(),
});

export const OrderIdInputSchema = z.object({
  orderId: z.string().uuid(),
});

export const RejectOrderInputSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const UpdateStatusInputSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "placed",
    "accepted",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ]),
});

export const RejectPaymentInputSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Output DTOs
// ---------------------------------------------------------------------------

export interface OrderItemDTO {
  id: string;
  menuItemId: string | null;
  itemVariantId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  branchId: string;
  customerId: string | null;
  orderType: string;
  customerName: string | null;
  customerPhone: string | null;
  tableNumber: string | null;
  tableSessionId: string | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentScreenshotUrl: string | null;
  specialInstructions: string | null;
  itemCount: number;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderDTO {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantSlug: string;
  branchLabel: string;
  status: string;
  itemCount: number;
  totalAmount: number;
  placedAt: string;
  items: CustomerOrderItemDTO[];
  hasReview: boolean;
}

export interface CustomerOrderItemDTO {
  menuItemId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
}

export interface TimelineEventDTO {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  createdAt: string;
}

export interface ReorderResultDTO {
  branchId: string;
  restaurantSlug: string;
  items: {
    menuItemId: string;
    name: string;
    unitPrice: number;
    isAvailable: boolean;
  }[];
}

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type ListByBranchInput = z.infer<typeof ListByBranchInputSchema>;
