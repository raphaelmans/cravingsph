"use client";

import { useMemo, useState } from "react";
import type { OrderRecord, OrderTab } from "../types";
import { TAB_STATUS_MAP } from "../types";

// TODO: Replace with tRPC hooks once order module is built
// Pattern: useTRPC() → useQuery(trpc.order.listByBranch.queryOptions({ branchId, tab }))

/**
 * Stub: Returns empty order list.
 * Replace with `trpc.order.listByBranch` query once backend exists.
 */
export function useOrders(_branchId: string) {
  // Stub — returns empty array; will be replaced by tRPC query
  return {
    data: [] as OrderRecord[],
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
    // TODO: call trpc.order.accept.mutationOptions() + invalidate queries
    setIsPending(true);
    console.log("[stub] Accept order:", orderId, "branch:", branchId);
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

  const mutate = (orderId: string, _reason?: string) => {
    // TODO: call trpc.order.reject.mutationOptions() + invalidate queries
    setIsPending(true);
    console.log("[stub] Reject order:", orderId, "branch:", branchId);
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
    // TODO: call trpc.order.updateStatus.mutationOptions() + invalidate queries
    setIsPending(true);
    console.log(
      "[stub] Update status:",
      orderId,
      "→",
      newStatus,
      "branch:",
      branchId,
    );
    setIsPending(false);
  };

  return { mutate, isPending };
}

/**
 * Stub: Get single order detail.
 * Replace with `trpc.order.getDetail` query.
 */
export function useOrderDetail(_orderId: string) {
  return {
    data: null as OrderRecord | null,
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
    console.log("[stub] Confirm payment:", orderId, "branch:", branchId);
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

  const mutate = (orderId: string, _reason?: string) => {
    setIsPending(true);
    console.log("[stub] Reject payment:", orderId, "branch:", branchId);
    setIsPending(false);
  };

  return { mutate, isPending };
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
