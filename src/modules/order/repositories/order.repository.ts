import { and, desc, eq, sql } from "drizzle-orm";
import {
  branch,
  menuItem,
  order,
  orderItem,
  orderStatusHistory,
  restaurant,
} from "@/shared/infra/db/schema";
import type { DbClient } from "@/shared/infra/db/types";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface OrderRow {
  id: string;
  orderNumber: string;
  branchId: string;
  customerId: string | null;
  orderType: string;
  customerName: string | null;
  customerPhone: string | null;
  tableNumber: string | null;
  tableSessionId: string | null;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentScreenshotUrl: string | null;
  specialInstructions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemRow {
  id: string;
  orderId: string;
  menuItemId: string | null;
  itemVariantId: string | null;
  name: string;
  quantity: number;
  unitPrice: string;
  modifiers: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerOrderRow extends OrderRow {
  restaurantName: string;
  restaurantSlug: string;
  branchLabel: string;
  hasReview: boolean;
}

export interface TimelineRow {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  createdAt: Date;
}

export interface ReorderItemRow {
  menuItemId: string;
  name: string;
  unitPrice: string;
  isAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IOrderRepository {
  nextOrderNumber(): Promise<string>;
  create(data: {
    orderNumber: string;
    branchId: string;
    customerId: string | null;
    orderType: string;
    customerName?: string | null;
    customerPhone?: string | null;
    tableNumber?: string | null;
    tableSessionId?: string | null;
    totalAmount: number;
    specialInstructions?: string | null;
    paymentMethod?: string | null;
  }): Promise<OrderRow>;
  createItems(
    orderId: string,
    items: {
      menuItemId: string;
      itemVariantId?: string | null;
      name: string;
      quantity: number;
      unitPrice: number;
      modifiers?: { name: string; price: number }[];
    }[],
  ): Promise<void>;
  addTimelineEvent(data: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string | null;
    note?: string | null;
  }): Promise<void>;
  findById(id: string): Promise<OrderRow | null>;
  findItemsByOrderId(orderId: string): Promise<OrderItemRow[]>;
  findByBranch(branchId: string, status?: string): Promise<OrderRow[]>;
  findByCustomer(customerId: string): Promise<CustomerOrderRow[]>;
  findTimeline(orderId: string): Promise<TimelineRow[]>;
  updateStatus(orderId: string, status: string): Promise<void>;
  updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void>;
  findReorderItems(orderId: string): Promise<{
    branchId: string;
    restaurantSlug: string;
    items: ReorderItemRow[];
  } | null>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class OrderRepository implements IOrderRepository {
  constructor(private db: DbClient) {}

  async nextOrderNumber(): Promise<string> {
    const result = await this.db.execute<{ next_val: string }>(
      sql`SELECT COALESCE(MAX(CAST(REPLACE(order_number, 'ORD-', '') AS INTEGER)), 0) + 1 AS next_val FROM "order"`,
    );
    const val = result[0]?.next_val ?? "1";
    return `ORD-${String(val).padStart(4, "0")}`;
  }

  async create(data: {
    orderNumber: string;
    branchId: string;
    customerId: string | null;
    orderType: string;
    customerName?: string | null;
    customerPhone?: string | null;
    tableNumber?: string | null;
    tableSessionId?: string | null;
    totalAmount: number;
    specialInstructions?: string | null;
    paymentMethod?: string | null;
  }): Promise<OrderRow> {
    const rows = await this.db
      .insert(order)
      .values({
        orderNumber: data.orderNumber,
        branchId: data.branchId,
        customerId: data.customerId,
        orderType: data.orderType,
        customerName: data.customerName ?? null,
        customerPhone: data.customerPhone ?? null,
        tableNumber: data.tableNumber ?? null,
        tableSessionId: data.tableSessionId ?? null,
        totalAmount: String(data.totalAmount),
        specialInstructions: data.specialInstructions ?? null,
        paymentMethod: data.paymentMethod ?? null,
        status: "placed",
        paymentStatus: "pending",
      })
      .returning();

    return rows[0] as unknown as OrderRow;
  }

  async createItems(
    orderId: string,
    items: {
      menuItemId: string;
      itemVariantId?: string | null;
      name: string;
      quantity: number;
      unitPrice: number;
      modifiers?: { name: string; price: number }[];
    }[],
  ): Promise<void> {
    if (items.length === 0) return;

    await this.db.insert(orderItem).values(
      items.map((item) => ({
        orderId,
        menuItemId: item.menuItemId,
        itemVariantId: item.itemVariantId ?? null,
        name: item.name,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        modifiers: item.modifiers ?? [],
      })),
    );
  }

  async addTimelineEvent(data: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string | null;
    note?: string | null;
  }): Promise<void> {
    await this.db.insert(orderStatusHistory).values({
      orderId: data.orderId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      changedBy: data.changedBy,
      note: data.note ?? null,
    });
  }

  async findById(id: string): Promise<OrderRow | null> {
    const rows = await this.db
      .select()
      .from(order)
      .where(eq(order.id, id))
      .limit(1);

    return (rows[0] as unknown as OrderRow) ?? null;
  }

  async findItemsByOrderId(orderId: string): Promise<OrderItemRow[]> {
    const rows = await this.db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId))
      .orderBy(orderItem.createdAt);

    return rows as unknown as OrderItemRow[];
  }

  async findByBranch(branchId: string, status?: string): Promise<OrderRow[]> {
    const conditions = [eq(order.branchId, branchId)];
    if (status) {
      conditions.push(eq(order.status, status));
    }

    const rows = await this.db
      .select()
      .from(order)
      .where(and(...conditions))
      .orderBy(desc(order.createdAt));

    return rows as unknown as OrderRow[];
  }

  async findByCustomer(customerId: string): Promise<CustomerOrderRow[]> {
    const rows = await this.db
      .select({
        id: order.id,
        orderNumber: order.orderNumber,
        branchId: order.branchId,
        customerId: order.customerId,
        orderType: order.orderType,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        tableNumber: order.tableNumber,
        tableSessionId: order.tableSessionId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        paymentScreenshotUrl: order.paymentScreenshotUrl,
        specialInstructions: order.specialInstructions,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        branchLabel: branch.name,
        hasReview: sql<boolean>`EXISTS (
          SELECT 1 FROM review WHERE review.order_id = ${order.id}
        )`,
      })
      .from(order)
      .innerJoin(branch, eq(branch.id, order.branchId))
      .innerJoin(restaurant, eq(restaurant.id, branch.restaurantId))
      .where(eq(order.customerId, customerId))
      .orderBy(desc(order.createdAt));

    return rows as unknown as CustomerOrderRow[];
  }

  async findTimeline(orderId: string): Promise<TimelineRow[]> {
    const rows = await this.db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(orderStatusHistory.createdAt);

    return rows as unknown as TimelineRow[];
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    await this.db
      .update(order)
      .set({ status, updatedAt: new Date() })
      .where(eq(order.id, orderId));
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
  ): Promise<void> {
    await this.db
      .update(order)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(order.id, orderId));
  }

  async findReorderItems(orderId: string): Promise<{
    branchId: string;
    restaurantSlug: string;
    items: ReorderItemRow[];
  } | null> {
    // Get order + branch + restaurant in one query
    const orderRow = await this.db
      .select({
        branchId: order.branchId,
        restaurantSlug: restaurant.slug,
      })
      .from(order)
      .innerJoin(branch, eq(branch.id, order.branchId))
      .innerJoin(restaurant, eq(restaurant.id, branch.restaurantId))
      .where(eq(order.id, orderId))
      .limit(1);

    if (orderRow.length === 0) return null;

    // Get order items with availability check
    const items = await this.db
      .select({
        menuItemId: orderItem.menuItemId,
        name: orderItem.name,
        unitPrice: orderItem.unitPrice,
        isAvailable: sql<boolean>`COALESCE(${menuItem.isAvailable}, false)`,
      })
      .from(orderItem)
      .leftJoin(menuItem, eq(menuItem.id, orderItem.menuItemId))
      .where(eq(orderItem.orderId, orderId));

    return {
      branchId: orderRow[0].branchId,
      restaurantSlug: orderRow[0].restaurantSlug,
      items: items.map((item) => ({
        menuItemId: item.menuItemId ?? "",
        name: item.name,
        unitPrice: item.unitPrice,
        isAvailable: item.isAvailable,
      })),
    };
  }
}
