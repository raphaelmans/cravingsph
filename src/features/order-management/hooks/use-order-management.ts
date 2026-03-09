"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import type { OrderRecord, OrderTab } from "../types";
import { TAB_STATUS_MAP } from "../types";

/**
 * List orders for a branch, backed by order.listByBranch.
 */
export function useOrders(branchId: string) {
  const trpc = useTRPC();

  const query = useQuery(trpc.order.listByBranch.queryOptions({ branchId }));

  const data: OrderRecord[] = useMemo(
    () =>
      (query.data ?? []).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        branchId: o.branchId,
        status: o.status as OrderRecord["status"],
        orderType: o.orderType as OrderRecord["orderType"],
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        tableNumber: o.tableNumber,
        itemCount: o.itemCount,
        totalAmount: o.totalAmount,
        specialInstructions: o.specialInstructions,
        paymentStatus: o.paymentStatus as OrderRecord["paymentStatus"],
        paymentMethod: o.paymentMethod,
        paymentReference: o.paymentReference,
        paymentScreenshotUrl: o.paymentScreenshotUrl,
        items: o.items.map((i) => ({
          name: i.name,
          variantName: null,
          modifiers: i.modifiers.map((m) => m.name),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      })),
    [query.data],
  );

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Accept order mutation.
 */
export function useAcceptOrder(branchId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.order.accept.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listByBranch.queryKey({ branchId }),
        });
      },
    }),
  );

  return {
    mutate: (orderId: string) => mutation.mutate({ orderId }),
    isPending: mutation.isPending,
  };
}

/**
 * Reject order mutation.
 */
export function useRejectOrder(branchId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.order.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listByBranch.queryKey({ branchId }),
        });
      },
    }),
  );

  return {
    mutate: (orderId: string, reason?: string) =>
      mutation.mutate({ orderId, reason }),
    isPending: mutation.isPending,
  };
}

/**
 * Update order status mutation.
 */
export function useUpdateOrderStatus(branchId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.order.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listByBranch.queryKey({ branchId }),
        });
      },
    }),
  );

  return {
    mutate: (orderId: string, status: OrderRecord["status"]) =>
      mutation.mutate({ orderId, status }),
    isPending: mutation.isPending,
  };
}

/**
 * Get single order detail.
 */
export function useOrderDetail(orderId: string) {
  const trpc = useTRPC();

  const query = useQuery(trpc.order.getDetail.queryOptions({ orderId }));

  const data: OrderRecord | null = useMemo(() => {
    const o = query.data;
    if (!o) return null;
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      branchId: o.branchId,
      status: o.status as OrderRecord["status"],
      orderType: o.orderType as OrderRecord["orderType"],
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      tableNumber: o.tableNumber,
      itemCount: o.itemCount,
      totalAmount: o.totalAmount,
      specialInstructions: o.specialInstructions,
      paymentStatus: o.paymentStatus as OrderRecord["paymentStatus"],
      paymentMethod: o.paymentMethod,
      paymentReference: o.paymentReference,
      paymentScreenshotUrl: o.paymentScreenshotUrl,
      items: o.items.map((i) => ({
        name: i.name,
        variantName: null,
        modifiers: i.modifiers.map((m) => m.name),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  }, [query.data]);

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Confirm payment mutation.
 */
export function useConfirmPayment(branchId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.order.confirmPayment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listByBranch.queryKey({ branchId }),
        });
      },
    }),
  );

  return {
    mutate: (orderId: string) => mutation.mutate({ orderId }),
    isPending: mutation.isPending,
  };
}

/**
 * Reject payment mutation.
 */
export function useRejectPayment(branchId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    trpc.order.rejectPayment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listByBranch.queryKey({ branchId }),
        });
      },
    }),
  );

  return {
    mutate: (orderId: string, reason?: string) =>
      mutation.mutate({ orderId, reason }),
    isPending: mutation.isPending,
  };
}

/**
 * Get order status timeline events.
 */
export function useOrderTimeline(orderId: string) {
  const trpc = useTRPC();

  const query = useQuery(trpc.order.getTimeline.queryOptions({ orderId }));

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
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
