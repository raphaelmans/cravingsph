"use client";

import { useMemo, useSyncExternalStore } from "react";
import { type CartItem, useCartStore } from "@/features/cart/stores/cart.store";

export interface CustomerOrderItem
  extends Omit<CartItem, "uuid" | "imageUrl" | "unitPrice"> {
  unitPrice: number;
  imageUrl: string | null;
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

interface CustomerOrdersStore {
  orders: CustomerOrderRecord[];
  reviews: CustomerReview[];
}

interface SubmitReviewInput {
  orderId: string;
  rating: number;
  comment: string;
  authorName: string;
}

interface ReorderResult {
  restaurantName: string;
  restaurantSlug: string;
  addedLineItems: number;
  addedQuantity: number;
  replacedExistingCart: boolean;
  skippedItems: string[];
}

const INITIAL_STORE: CustomerOrdersStore = {
  orders: [
    {
      id: "history-1001",
      orderNumber: "1001",
      restaurantName: "Mang Inasal",
      restaurantSlug: "mang-inasal-sm-north",
      branchLabel: "SM North EDSA",
      status: "completed",
      itemCount: 3,
      totalAmount: 728,
      placedAt: "2026-03-07T12:20:00.000Z",
      items: [
        {
          menuItemId: "demo-inasal-quarter",
          name: "Chicken Inasal",
          imageUrl: null,
          basePrice: 189,
          variantId: "quarter-meal",
          variantName: "Quarter Meal",
          variantPrice: 189,
          modifiers: [
            { id: "java-rice", name: "Java Rice", price: 0 },
            { id: "atchara", name: "Extra Atchara", price: 0 },
          ],
          quantity: 2,
          unitPrice: 189,
          isAvailable: true,
        },
        {
          menuItemId: "demo-calamansi-juice",
          name: "Calamansi Juice",
          imageUrl: null,
          basePrice: 110,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [{ id: "less-ice", name: "Less Ice", price: 0 }],
          quantity: 1,
          unitPrice: 110,
          isAvailable: true,
        },
        {
          menuItemId: "demo-leche-flan",
          name: "Leche Flan",
          imageUrl: null,
          basePrice: 240,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [],
          quantity: 1,
          unitPrice: 240,
          isAvailable: false,
        },
      ],
    },
    {
      id: "history-1002",
      orderNumber: "1002",
      restaurantName: "Lugawan sa Kanto",
      restaurantSlug: "lugawan-sa-kanto",
      branchLabel: "Katipunan Avenue",
      status: "completed",
      itemCount: 2,
      totalAmount: 324,
      placedAt: "2026-03-04T08:10:00.000Z",
      items: [
        {
          menuItemId: "demo-goto",
          name: "Goto",
          imageUrl: null,
          basePrice: 124,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [{ id: "crispy-garlic", name: "Crispy Garlic", price: 0 }],
          quantity: 1,
          unitPrice: 124,
          isAvailable: true,
        },
        {
          menuItemId: "demo-tokwa",
          name: "Tokwa't Baboy",
          imageUrl: null,
          basePrice: 200,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [],
          quantity: 1,
          unitPrice: 200,
          isAvailable: true,
        },
      ],
    },
    {
      id: "history-1003",
      orderNumber: "1003",
      restaurantName: "Brew Coffee Co.",
      restaurantSlug: "brew-coffee-co",
      branchLabel: "BGC High Street",
      status: "cancelled",
      itemCount: 2,
      totalAmount: 360,
      placedAt: "2026-02-28T17:35:00.000Z",
      items: [
        {
          menuItemId: "demo-spanish-latte",
          name: "Iced Spanish Latte",
          imageUrl: null,
          basePrice: 190,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [{ id: "oat-milk", name: "Oat Milk", price: 40 }],
          quantity: 1,
          unitPrice: 230,
          isAvailable: true,
        },
        {
          menuItemId: "demo-ensaymada",
          name: "Ensaymada",
          imageUrl: null,
          basePrice: 130,
          variantId: null,
          variantName: null,
          variantPrice: null,
          modifiers: [],
          quantity: 1,
          unitPrice: 130,
          isAvailable: true,
        },
      ],
    },
  ],
  reviews: [
    {
      id: "review-1",
      orderId: "seed-review-1",
      restaurantSlug: "mang-inasal-sm-north",
      restaurantName: "Mang Inasal",
      authorName: "Alyssa P.",
      rating: 5,
      comment:
        "Chicken was still juicy when it got home and the pickup queue moved fast.",
      createdAt: "2026-03-03T10:00:00.000Z",
    },
    {
      id: "review-2",
      orderId: "seed-review-2",
      restaurantSlug: "lugawan-sa-kanto",
      restaurantName: "Lugawan sa Kanto",
      authorName: "Marco D.",
      rating: 4,
      comment:
        "Comfort food done right. The broth was generous and the toppings still had texture.",
      createdAt: "2026-03-01T07:25:00.000Z",
    },
  ],
};

let customerOrdersStore = INITIAL_STORE;
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

function getSnapshot() {
  return customerOrdersStore;
}

function getOrder(orderId: string) {
  return (
    customerOrdersStore.orders.find((order) => order.id === orderId) ?? null
  );
}

function addReview(input: SubmitReviewInput) {
  const order = getOrder(input.orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const hasExistingReview = customerOrdersStore.reviews.some(
    (review) => review.orderId === input.orderId,
  );
  if (hasExistingReview) {
    throw new Error("Review already submitted for this order");
  }

  customerOrdersStore = {
    ...customerOrdersStore,
    reviews: [
      {
        id: `review-${Date.now()}`,
        orderId: input.orderId,
        restaurantSlug: order.restaurantSlug,
        restaurantName: order.restaurantName,
        authorName: input.authorName,
        rating: input.rating,
        comment: input.comment,
        createdAt: new Date().toISOString(),
      },
      ...customerOrdersStore.reviews,
    ],
  };

  emitChange();
}

export function useCustomerOrders() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const cartBranch = useCartStore((state) => state.branchSlug);
  const cartSize = useCartStore((state) => state.items.length);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const setBranch = useCartStore((state) => state.setBranch);

  const orders = useMemo(
    () =>
      [...snapshot.orders].sort(
        (left, right) =>
          new Date(right.placedAt).getTime() -
          new Date(left.placedAt).getTime(),
      ),
    [snapshot.orders],
  );

  const reviewedOrderIds = useMemo(
    () => new Set(snapshot.reviews.map((review) => review.orderId)),
    [snapshot.reviews],
  );

  const reorderOrder = (orderId: string): ReorderResult | null => {
    const order = getOrder(orderId);
    if (!order) {
      return null;
    }

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
        menuItemId: item.menuItemId,
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

  const submitReview = (input: SubmitReviewInput) => {
    addReview(input);
  };

  return {
    orders,
    reviewedOrderIds,
    submitReview,
    reorderOrder,
  };
}

export function useRestaurantReviews(restaurantSlug: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const reviews = useMemo(
    () =>
      snapshot.reviews
        .filter((review) => review.restaurantSlug === restaurantSlug)
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        ),
    [restaurantSlug, snapshot.reviews],
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  return {
    reviews,
    averageRating,
    totalReviews: reviews.length,
  };
}
