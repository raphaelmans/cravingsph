"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCartStore } from "@/features/cart/stores/cart.store";
import { useTRPC } from "@/trpc/client";

export interface CustomerOrderItem {
  menuItemId: string | null;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  variantId: string | null;
  variantName: string | null;
  variantPrice: number | null;
  modifiers: { id: string; name: string; price: number }[];
  quantity: number;
  unitPrice: number;
  isAvailable: boolean;
}

export interface CustomerOrderRecord {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantSlug: string;
  branchLabel: string;
  status: "completed" | "cancelled";
  itemCount: number;
  totalAmount: number;
  placedAt: string;
  items: CustomerOrderItem[];
}

export interface CustomerReview {
  id: string;
  orderId: string;
  restaurantSlug: string;
  restaurantName: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReorderResult {
  restaurantName: string;
  restaurantSlug: string;
  addedLineItems: number;
  addedQuantity: number;
  replacedExistingCart: boolean;
  skippedItems: string[];
}

export function useCustomerOrders() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const cartBranch = useCartStore((state) => state.branchSlug);
  const cartSize = useCartStore((state) => state.items.length);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const setBranch = useCartStore((state) => state.setBranch);

  const listQuery = useQuery(trpc.order.listMine.queryOptions());

  const orders: CustomerOrderRecord[] = useMemo(
    () =>
      (listQuery.data ?? [])
        .map(
          (o): CustomerOrderRecord => ({
            id: o.id,
            orderNumber: o.orderNumber,
            restaurantName: o.restaurantName,
            restaurantSlug: o.restaurantSlug,
            branchLabel: o.branchLabel,
            status: o.status as "completed" | "cancelled",
            itemCount: o.itemCount,
            totalAmount: o.totalAmount,
            placedAt: o.placedAt,
            items: o.items.map(
              (item): CustomerOrderItem => ({
                menuItemId: item.menuItemId,
                name: item.name,
                imageUrl: null,
                basePrice: item.unitPrice,
                variantId: null,
                variantName: null,
                variantPrice: null,
                modifiers: item.modifiers.map((m) => ({
                  id: m.name.toLowerCase().replace(/\s+/g, "-"),
                  name: m.name,
                  price: m.price,
                })),
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                isAvailable: true,
              }),
            ),
          }),
        )
        .sort(
          (left, right) =>
            new Date(right.placedAt).getTime() -
            new Date(left.placedAt).getTime(),
        ),
    [listQuery.data],
  );

  const reviewedOrderIds = useMemo(
    () =>
      new Set(
        (listQuery.data ?? []).filter((o) => o.hasReview).map((o) => o.id),
      ),
    [listQuery.data],
  );

  const reorderOrder = (orderId: string): ReorderResult | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const availableItems = order.items.filter((item) => item.isAvailable);
    const skippedItems = order.items
      .filter((item) => !item.isAvailable)
      .map((item) => item.name);

    const shouldReplaceCart =
      Boolean(cartBranch) &&
      cartBranch !== order.restaurantSlug &&
      cartSize > 0;

    if (shouldReplaceCart) {
      clearCart();
    }

    if (availableItems.length > 0) {
      setBranch(order.restaurantSlug);
    }

    for (const item of availableItems) {
      addItem({
        uuid: "",
        menuItemId: item.menuItemId ?? "",
        name: item.name,
        imageUrl: item.imageUrl,
        basePrice: item.basePrice,
        variantId: item.variantId,
        variantName: item.variantName,
        variantPrice: item.variantPrice,
        modifiers: item.modifiers,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    return {
      restaurantName: order.restaurantName,
      restaurantSlug: order.restaurantSlug,
      addedLineItems: availableItems.length,
      addedQuantity: availableItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      replacedExistingCart: shouldReplaceCart,
      skippedItems,
    };
  };

  const reviewMutation = useMutation(
    trpc.review.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.order.listMine.queryKey(),
        });
      },
    }),
  );

  const submitReview = (input: {
    orderId: string;
    rating: number;
    comment: string;
    authorName: string;
  }) => {
    reviewMutation.mutate(input);
  };

  return {
    orders,
    reviewedOrderIds,
    submitReview,
    reorderOrder,
    isLoading: listQuery.isLoading,
  };
}

export function useRestaurantReviews(restaurantSlug: string) {
  const trpc = useTRPC();

  const reviewsQuery = useQuery(
    trpc.review.listByRestaurant.queryOptions({ restaurantSlug }),
  );

  const data = reviewsQuery.data;

  return {
    reviews: (data?.reviews ?? []) as CustomerReview[],
    averageRating: data?.averageRating ?? 0,
    totalReviews: data?.totalReviews ?? 0,
    isLoading: reviewsQuery.isLoading,
  };
}
