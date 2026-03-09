"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { OrderRecord, OrderTab } from "../types";
import { TAB_STATUS_MAP } from "../types";

// TODO: Replace with tRPC hooks once order module is built.
// Pattern: useTRPC() → useQuery(trpc.order.*.queryOptions(...))

const PAYMENT_PROOF_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff5ee" />
        <stop offset="100%" stop-color="#ffe0cc" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#bg)" rx="32" />
    <rect x="88" y="88" width="1024" height="724" rx="28" fill="#ffffff" stroke="#f7c7aa" stroke-width="4" />
    <text x="140" y="180" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#1f2937">GCash Transfer Receipt</text>
    <text x="140" y="250" font-family="Courier New, monospace" font-size="30" fill="#f86006">Ref: GCA-88217419</text>
    <text x="140" y="330" font-family="Arial, sans-serif" font-size="32" fill="#374151">Sent to Kusina ni Maria</text>
    <text x="140" y="400" font-family="Arial, sans-serif" font-size="96" font-weight="700" fill="#111827">PHP 728.00</text>
    <text x="140" y="490" font-family="Arial, sans-serif" font-size="28" fill="#6b7280">Mar 9, 2026 7:41 PM</text>
    <rect x="140" y="560" width="920" height="132" rx="24" fill="#fff3eb" />
    <text x="180" y="636" font-family="Arial, sans-serif" font-size="30" fill="#9a3412">Proof uploaded by customer for manual review</text>
  </svg>
`)}`;

interface OrderStoreState {
  orders: OrderRecord[];
  timelines: Record<string, import("../types").OrderStatusEvent[]>;
}

const INITIAL_STATE: OrderStoreState = {
  orders: [
    {
      id: "order-1001",
      orderNumber: "1001",
      branchId: "branch-demo",
      status: "placed",
      orderType: "pickup",
      customerName: "Miguel Dela Cruz",
      customerPhone: "09171234567",
      tableNumber: null,
      itemCount: 3,
      totalAmount: 728,
      specialInstructions: "Pack utensils separately.",
      paymentStatus: "submitted",
      paymentMethod: "gcash",
      paymentReference: "GCA-88217419",
      paymentScreenshotUrl: PAYMENT_PROOF_IMAGE,
      items: [
        {
          name: "Chicken Inasal",
          variantName: "Quarter Meal",
          modifiers: ["Java Rice", "Extra Atchara"],
          quantity: 2,
          unitPrice: 189,
        },
        {
          name: "Calamansi Juice",
          variantName: null,
          modifiers: ["Less Ice"],
          quantity: 1,
          unitPrice: 110,
        },
        {
          name: "Leche Flan",
          variantName: null,
          modifiers: [],
          quantity: 1,
          unitPrice: 240,
        },
      ],
      createdAt: "2026-03-09T11:40:00.000Z",
      updatedAt: "2026-03-09T11:42:00.000Z",
    },
    {
      id: "order-1002",
      orderNumber: "1002",
      branchId: "branch-demo",
      status: "preparing",
      orderType: "dine-in",
      customerName: null,
      customerPhone: null,
      tableNumber: "12",
      itemCount: 2,
      totalAmount: 544,
      specialInstructions: "Serve the soup first.",
      paymentStatus: "confirmed",
      paymentMethod: "cash",
      paymentReference: null,
      paymentScreenshotUrl: null,
      items: [
        {
          name: "Sinigang na Baboy",
          variantName: "Solo",
          modifiers: ["Extra Kangkong"],
          quantity: 1,
          unitPrice: 264,
        },
        {
          name: "Garlic Rice",
          variantName: null,
          modifiers: [],
          quantity: 2,
          unitPrice: 140,
        },
      ],
      createdAt: "2026-03-09T10:10:00.000Z",
      updatedAt: "2026-03-09T10:18:00.000Z",
    },
    {
      id: "order-1003",
      orderNumber: "1003",
      branchId: "branch-demo",
      status: "completed",
      orderType: "pickup",
      customerName: "Andrea Santos",
      customerPhone: "09999887766",
      tableNumber: null,
      itemCount: 1,
      totalAmount: 320,
      specialInstructions: null,
      paymentStatus: "confirmed",
      paymentMethod: "maya",
      paymentReference: "MAYA-447281",
      paymentScreenshotUrl: null,
      items: [
        {
          name: "Pancit Canton",
          variantName: "Bilao Small",
          modifiers: [],
          quantity: 1,
          unitPrice: 320,
        },
      ],
      createdAt: "2026-03-09T08:15:00.000Z",
      updatedAt: "2026-03-09T08:45:00.000Z",
    },
    {
      id: "order-1004",
      orderNumber: "1004",
      branchId: "branch-demo",
      status: "cancelled",
      orderType: "pickup",
      customerName: "Jessa Ramos",
      customerPhone: "09180001111",
      tableNumber: null,
      itemCount: 2,
      totalAmount: 498,
      specialInstructions: "No spicy oil.",
      paymentStatus: "rejected",
      paymentMethod: "gcash",
      paymentReference: "GCA-99171288",
      paymentScreenshotUrl: null,
      items: [
        {
          name: "Lomi",
          variantName: null,
          modifiers: ["Extra Egg"],
          quantity: 2,
          unitPrice: 249,
        },
      ],
      createdAt: "2026-03-09T07:05:00.000Z",
      updatedAt: "2026-03-09T07:12:00.000Z",
    },
  ],
  timelines: {
    "order-1001": [
      {
        id: "evt-1001-1",
        orderId: "order-1001",
        fromStatus: null,
        toStatus: "placed",
        changedBy: "Customer",
        note: "Pickup order submitted from QR menu.",
        createdAt: "2026-03-09T11:40:00.000Z",
      },
    ],
    "order-1002": [
      {
        id: "evt-1002-1",
        orderId: "order-1002",
        fromStatus: null,
        toStatus: "placed",
        changedBy: "Customer",
        note: "Dine-in order sent from Table 12.",
        createdAt: "2026-03-09T10:10:00.000Z",
      },
      {
        id: "evt-1002-2",
        orderId: "order-1002",
        fromStatus: "placed",
        toStatus: "accepted",
        changedBy: "Branch Cashier",
        note: "Payment marked as cash at counter.",
        createdAt: "2026-03-09T10:12:00.000Z",
      },
      {
        id: "evt-1002-3",
        orderId: "order-1002",
        fromStatus: "accepted",
        toStatus: "preparing",
        changedBy: "Kitchen",
        note: "Items fired to the hot station.",
        createdAt: "2026-03-09T10:18:00.000Z",
      },
    ],
    "order-1003": [
      {
        id: "evt-1003-1",
        orderId: "order-1003",
        fromStatus: null,
        toStatus: "placed",
        changedBy: "Customer",
        note: null,
        createdAt: "2026-03-09T08:15:00.000Z",
      },
      {
        id: "evt-1003-2",
        orderId: "order-1003",
        fromStatus: "placed",
        toStatus: "accepted",
        changedBy: "Branch Owner",
        note: null,
        createdAt: "2026-03-09T08:18:00.000Z",
      },
      {
        id: "evt-1003-3",
        orderId: "order-1003",
        fromStatus: "accepted",
        toStatus: "ready",
        changedBy: "Kitchen",
        note: null,
        createdAt: "2026-03-09T08:34:00.000Z",
      },
      {
        id: "evt-1003-4",
        orderId: "order-1003",
        fromStatus: "ready",
        toStatus: "completed",
        changedBy: "Branch Owner",
        note: "Customer picked up the order.",
        createdAt: "2026-03-09T08:45:00.000Z",
      },
    ],
    "order-1004": [
      {
        id: "evt-1004-1",
        orderId: "order-1004",
        fromStatus: null,
        toStatus: "placed",
        changedBy: "Customer",
        note: null,
        createdAt: "2026-03-09T07:05:00.000Z",
      },
      {
        id: "evt-1004-2",
        orderId: "order-1004",
        fromStatus: "placed",
        toStatus: "cancelled",
        changedBy: "Branch Owner",
        note: "Rejected after invalid proof submission.",
        createdAt: "2026-03-09T07:12:00.000Z",
      },
    ],
  },
};

let orderStore = INITIAL_STATE;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getStoreSnapshot() {
  return orderStore;
}

function patchOrder(
  orderId: string,
  updater: (order: OrderRecord) => OrderRecord,
) {
  let didUpdate = false;

  orderStore = {
    ...orderStore,
    orders: orderStore.orders.map((order) => {
      if (order.id !== orderId) {
        return order;
      }

      didUpdate = true;
      return updater(order);
    }),
  };

  if (didUpdate) {
    emitChange();
  }

  return didUpdate;
}

function appendTimelineEvent(
  orderId: string,
  fromStatus: OrderRecord["status"] | null,
  toStatus: OrderRecord["status"],
  changedBy: string,
  note?: string,
) {
  const event: import("../types").OrderStatusEvent = {
    id: `evt-${orderId}-${Date.now()}`,
    orderId,
    fromStatus,
    toStatus,
    changedBy,
    note: note ?? null,
    createdAt: new Date().toISOString(),
  };

  orderStore = {
    ...orderStore,
    timelines: {
      ...orderStore.timelines,
      [orderId]: [...(orderStore.timelines[orderId] ?? []), event],
    },
  };
}

/**
 * Stub: Returns a shared in-memory order list for the branch.
 * Replace with `trpc.order.listByBranch` query once backend exists.
 */
export function useOrders(branchId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getStoreSnapshot,
    getStoreSnapshot,
  );
  const branchOrders = snapshot.orders.filter(
    (order) => order.branchId === branchId,
  );

  return {
    data: branchOrders.length > 0 ? branchOrders : snapshot.orders,
    isLoading: false,
    error: null,
  };
}

/**
 * Stub: Accept order mutation.
 * Replace with `trpc.order.accept` mutation.
 */
export function useAcceptOrder(branchId: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = (orderId: string) => {
    setIsPending(true);
    patchOrder(orderId, (order) => ({
      ...order,
      branchId,
      status: "accepted",
      updatedAt: new Date().toISOString(),
    }));
    appendTimelineEvent(
      orderId,
      "placed",
      "accepted",
      "Branch Owner",
      "Order accepted and sent to the kitchen queue.",
    );
    emitChange();
    setIsPending(false);
  };

  return { mutate, isPending };
}

/**
 * Stub: Reject order mutation.
 * Replace with `trpc.order.reject` mutation.
 */
export function useRejectOrder(branchId: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = (orderId: string, reason?: string) => {
    setIsPending(true);
    let previousStatus: OrderRecord["status"] | null = null;

    patchOrder(orderId, (order) => {
      previousStatus = order.status;
      return {
        ...order,
        branchId,
        status: "cancelled",
        updatedAt: new Date().toISOString(),
      };
    });
    appendTimelineEvent(
      orderId,
      previousStatus,
      "cancelled",
      "Branch Owner",
      reason ?? "Order rejected by the restaurant.",
    );
    emitChange();
    setIsPending(false);
  };

  return { mutate, isPending };
}

/**
 * Stub: Update order status mutation.
 * Replace with `trpc.order.updateStatus` mutation.
 */
export function useUpdateOrderStatus(branchId: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = (orderId: string, newStatus: OrderRecord["status"]) => {
    setIsPending(true);
    let previousStatus: OrderRecord["status"] | null = null;

    patchOrder(orderId, (order) => {
      previousStatus = order.status;
      return {
        ...order,
        branchId,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    });
    appendTimelineEvent(
      orderId,
      previousStatus,
      newStatus,
      "Branch Team",
      `Status updated to ${newStatus}.`,
    );
    emitChange();
    setIsPending(false);
  };

  return { mutate, isPending };
}

/**
 * Stub: Get single order detail from the shared in-memory store.
 * Replace with `trpc.order.getDetail` query once backend exists.
 */
export function useOrderDetail(orderId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getStoreSnapshot,
    getStoreSnapshot,
  );

  return {
    data: snapshot.orders.find((order) => order.id === orderId) ?? null,
    isLoading: false,
    error: null,
  };
}

/**
 * Stub: Confirm payment.
 * Replace with `trpc.order.confirmPayment` mutation.
 */
export function useConfirmPayment(branchId: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = (orderId: string) => {
    setIsPending(true);
    patchOrder(orderId, (order) => ({
      ...order,
      branchId,
      paymentStatus: "confirmed",
      updatedAt: new Date().toISOString(),
    }));
    setIsPending(false);
  };

  return { mutate, isPending };
}

/**
 * Stub: Reject payment.
 * Replace with `trpc.order.rejectPayment` mutation.
 */
export function useRejectPayment(branchId: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = (orderId: string, reason?: string) => {
    setIsPending(true);
    patchOrder(orderId, (order) => ({
      ...order,
      branchId,
      paymentStatus: "rejected",
      updatedAt: new Date().toISOString(),
    }));
    setIsPending(false);
    void reason;
  };

  return { mutate, isPending };
}

/**
 * Stub: Get order status timeline events from the shared in-memory store.
 * Replace with `trpc.order.getTimeline` query once backend exists.
 */
export function useOrderTimeline(orderId: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getStoreSnapshot,
    getStoreSnapshot,
  );

  return {
    data: snapshot.timelines[orderId] ?? [],
    isLoading: false,
    error: null,
  };
}

/**
 * Computes tab badge counts from an order list.
 */
export function useOrderTabCounts(orders: OrderRecord[]) {
  return useMemo(() => {
    const counts: Record<OrderTab, number> = {
      inbox: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const order of orders) {
      for (const [tab, statuses] of Object.entries(TAB_STATUS_MAP)) {
        if (statuses.includes(order.status)) {
          counts[tab as OrderTab]++;
        }
      }
    }
    return counts;
  }, [orders]);
}
