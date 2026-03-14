import type {
  CreateOrderInput,
  CustomerOrderDTO,
  CustomerOrderItemDTO,
  OrderDTO,
  OrderItemDTO,
  ReorderResultDTO,
  TimelineEventDTO,
} from "../dtos/order.dto";
import {
  BranchNotAcceptingOrdersError,
  InvalidStatusTransitionError,
  OrderNotFoundError,
  OrderNotOwnedError,
  TableSessionNotActiveError,
  TableSessionNotFoundError,
} from "../errors/order.errors";
import type {
  CustomerOrderRow,
  IOrderRepository,
  OrderItemRow,
  OrderRow,
} from "../repositories/order.repository";

// ---------------------------------------------------------------------------
// Valid status transitions
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<string, string[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
};

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IBranchChecker {
  isOrderingEnabled(branchId: string): Promise<boolean>;
}

export interface ITableSessionChecker {
  getActiveSession(tableSessionId: string): Promise<{
    id: string;
    branchTableId: string;
    tableLabel: string;
    tableCode: string;
    status: string;
  } | null>;
}

export interface IOrderService {
  create(customerId: string, input: CreateOrderInput): Promise<OrderDTO>;
  listMine(customerId: string): Promise<CustomerOrderDTO[]>;
  getDetail(userId: string, orderId: string): Promise<OrderDTO>;
  listByBranch(branchId: string, status?: string): Promise<OrderDTO[]>;
  accept(userId: string, orderId: string): Promise<void>;
  reject(userId: string, orderId: string, reason?: string): Promise<void>;
  updateStatus(userId: string, orderId: string, status: string): Promise<void>;
  confirmPayment(userId: string, orderId: string): Promise<void>;
  rejectPayment(
    userId: string,
    orderId: string,
    reason?: string,
  ): Promise<void>;
  getTimeline(orderId: string): Promise<TimelineEventDTO[]>;
  reorder(userId: string, orderId: string): Promise<ReorderResultDTO>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class OrderService implements IOrderService {
  constructor(
    private repository: IOrderRepository,
    private branchChecker: IBranchChecker,
    private tableSessionChecker: ITableSessionChecker,
  ) {}

  async create(customerId: string, input: CreateOrderInput): Promise<OrderDTO> {
    // Check if branch accepts orders
    const enabled = await this.branchChecker.isOrderingEnabled(input.branchId);
    if (!enabled) {
      throw new BranchNotAcceptingOrdersError(input.branchId);
    }

    // Calculate total
    const totalAmount = input.items.reduce((sum, item) => {
      const modifiersTotal = (item.modifiers ?? []).reduce(
        (ms, m) => ms + m.price,
        0,
      );
      return sum + (item.unitPrice + modifiersTotal) * item.quantity;
    }, 0);

    const orderNumber = await this.repository.nextOrderNumber();

    // Resolve table session → denormalized table label
    let tableNumber = input.tableNumber ?? null;
    const tableSessionId: string | null = input.tableSessionId ?? null;

    if (input.orderType === "dine-in" && tableSessionId) {
      const session =
        await this.tableSessionChecker.getActiveSession(tableSessionId);
      if (!session) {
        throw new TableSessionNotFoundError(tableSessionId);
      }
      if (session.status !== "active") {
        throw new TableSessionNotActiveError(tableSessionId);
      }
      tableNumber = session.tableLabel;
    }

    const orderRow = await this.repository.create({
      orderNumber,
      branchId: input.branchId,
      customerId,
      orderType: input.orderType,
      customerName: input.customerName ?? null,
      customerPhone: input.customerPhone ?? null,
      tableNumber,
      tableSessionId,
      totalAmount,
      specialInstructions: input.specialInstructions ?? null,
      paymentMethod: input.paymentMethod ?? null,
    });

    await this.repository.createItems(
      orderRow.id,
      input.items.map((item) => ({
        menuItemId: item.menuItemId,
        itemVariantId: item.itemVariantId ?? null,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        modifiers: item.modifiers ?? [],
      })),
    );

    // Add initial timeline event
    await this.repository.addTimelineEvent({
      orderId: orderRow.id,
      fromStatus: null,
      toStatus: "placed",
      changedBy: customerId,
      note: `${input.orderType === "dine-in" ? "Dine-in" : "Pickup"} order placed.`,
    });

    const items = await this.repository.findItemsByOrderId(orderRow.id);
    return this.toOrderDTO(orderRow, items);
  }

  async listMine(customerId: string): Promise<CustomerOrderDTO[]> {
    const rows = await this.repository.findByCustomer(customerId);
    const result: CustomerOrderDTO[] = [];

    for (const row of rows) {
      const items = await this.repository.findItemsByOrderId(row.id);
      result.push(this.toCustomerOrderDTO(row, items));
    }

    return result;
  }

  async getDetail(_userId: string, orderId: string): Promise<OrderDTO> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    const items = await this.repository.findItemsByOrderId(orderId);
    return this.toOrderDTO(orderRow, items);
  }

  async listByBranch(branchId: string, status?: string): Promise<OrderDTO[]> {
    const rows = await this.repository.findByBranch(branchId, status);
    const result: OrderDTO[] = [];

    for (const row of rows) {
      const items = await this.repository.findItemsByOrderId(row.id);
      result.push(this.toOrderDTO(row, items));
    }

    return result;
  }

  async accept(userId: string, orderId: string): Promise<void> {
    await this.transitionStatus(orderId, "accepted", userId, "Order accepted.");
  }

  async reject(
    userId: string,
    orderId: string,
    reason?: string,
  ): Promise<void> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    await this.repository.updateStatus(orderId, "cancelled");
    await this.repository.addTimelineEvent({
      orderId,
      fromStatus: orderRow.status,
      toStatus: "cancelled",
      changedBy: userId,
      note: reason ?? "Order rejected by the restaurant.",
    });
  }

  async updateStatus(
    userId: string,
    orderId: string,
    status: string,
  ): Promise<void> {
    await this.transitionStatus(
      orderId,
      status,
      userId,
      `Status updated to ${status}.`,
    );
  }

  async confirmPayment(userId: string, orderId: string): Promise<void> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    await this.repository.updatePaymentStatus(orderId, "confirmed");
    await this.repository.addTimelineEvent({
      orderId,
      fromStatus: null,
      toStatus: orderRow.status,
      changedBy: userId,
      note: "Payment confirmed.",
    });
  }

  async rejectPayment(
    userId: string,
    orderId: string,
    reason?: string,
  ): Promise<void> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    await this.repository.updatePaymentStatus(orderId, "rejected");
    await this.repository.addTimelineEvent({
      orderId,
      fromStatus: null,
      toStatus: orderRow.status,
      changedBy: userId,
      note: reason ?? "Payment rejected.",
    });
  }

  async getTimeline(orderId: string): Promise<TimelineEventDTO[]> {
    const rows = await this.repository.findTimeline(orderId);
    return rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      changedBy: r.changedBy,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async reorder(userId: string, orderId: string): Promise<ReorderResultDTO> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    if (orderRow.customerId !== userId) {
      throw new OrderNotOwnedError();
    }

    const result = await this.repository.findReorderItems(orderId);
    if (!result) throw new OrderNotFoundError(orderId);

    return {
      branchId: result.branchId,
      restaurantSlug: result.restaurantSlug,
      items: result.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: Number(item.unitPrice),
        isAvailable: item.isAvailable,
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private async transitionStatus(
    orderId: string,
    toStatus: string,
    changedBy: string,
    note: string,
  ): Promise<void> {
    const orderRow = await this.repository.findById(orderId);
    if (!orderRow) throw new OrderNotFoundError(orderId);

    const allowed = VALID_TRANSITIONS[orderRow.status];
    if (!allowed?.includes(toStatus)) {
      throw new InvalidStatusTransitionError(orderRow.status, toStatus);
    }

    await this.repository.updateStatus(orderId, toStatus);
    await this.repository.addTimelineEvent({
      orderId,
      fromStatus: orderRow.status,
      toStatus,
      changedBy,
      note,
    });
  }

  private toOrderDTO(row: OrderRow, items: OrderItemRow[]): OrderDTO {
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      branchId: row.branchId,
      customerId: row.customerId,
      orderType: row.orderType,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      tableNumber: row.tableNumber,
      tableSessionId: row.tableSessionId,
      totalAmount: Number(row.totalAmount),
      status: row.status,
      paymentStatus: row.paymentStatus,
      paymentMethod: row.paymentMethod,
      paymentReference: row.paymentReference,
      paymentScreenshotUrl: row.paymentScreenshotUrl,
      specialInstructions: row.specialInstructions,
      itemCount: items.length,
      items: items.map(this.toOrderItemDTO),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private toOrderItemDTO(item: OrderItemRow): OrderItemDTO {
    const modifiers = Array.isArray(item.modifiers)
      ? (item.modifiers as { name: string; price: number }[])
      : [];
    return {
      id: item.id,
      menuItemId: item.menuItemId,
      itemVariantId: item.itemVariantId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      modifiers,
    };
  }

  private toCustomerOrderDTO(
    row: CustomerOrderRow,
    items: OrderItemRow[],
  ): CustomerOrderDTO {
    return {
      id: row.id,
      orderNumber: row.orderNumber,
      restaurantName: row.restaurantName,
      restaurantSlug: row.restaurantSlug,
      branchLabel: row.branchLabel,
      status: row.status,
      itemCount: items.length,
      totalAmount: Number(row.totalAmount),
      placedAt: row.createdAt.toISOString(),
      items: items.map(
        (item): CustomerOrderItemDTO => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          modifiers: Array.isArray(item.modifiers)
            ? (item.modifiers as { name: string; price: number }[])
            : [],
        }),
      ),
      hasReview: row.hasReview,
    };
  }
}
