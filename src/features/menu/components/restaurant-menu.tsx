"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CartFloatingButton } from "@/features/cart/components/cart-floating-button";
import {
  type CartItem,
  computeUnitPrice,
  useCartActions,
  useCartItemCount,
  useCartItems,
  useCartTotal,
} from "@/features/cart/stores/cart.store";
import {
  CheckoutSheet,
  type CheckoutSubmitPayload,
} from "@/features/checkout/components/checkout-sheet";
import { OrderConfirmationSheet } from "@/features/checkout/components/order-confirmation-sheet";
import type {
  FullMenu,
  MenuItemWithDetails,
} from "@/modules/menu/repositories/menu.repository";
import { useCategoryObserver } from "../hooks/use-category-observer";
import { CategoryTabs } from "./category-tabs";
import { MenuItemSheet, type MenuItemSheetPayload } from "./menu-item-sheet";
import { MenuSearchSheet } from "./menu-search-sheet";
import { MenuSectionList } from "./menu-section-list";

interface RestaurantMenuProps {
  menu: FullMenu;
  branchSlug: string;
}

// --- Helpers ---

/** Build a CartItem from a simple menu item (no variants/modifiers). */
function buildSimpleCartItem(item: MenuItemWithDetails): CartItem {
  const cartItem: CartItem = {
    uuid: "", // assigned by store on add
    menuItemId: item.item.id,
    name: item.item.name,
    imageUrl: item.item.imageUrl,
    basePrice: Number(item.item.basePrice),
    variantId: null,
    variantName: null,
    variantPrice: null,
    modifiers: [],
    quantity: 1,
    unitPrice: Number(item.item.basePrice),
  };
  return cartItem;
}

/** Build a CartItem from the MenuItemSheet payload + full item details. */
function buildCartItemFromPayload(
  item: MenuItemWithDetails,
  payload: MenuItemSheetPayload,
): CartItem {
  const variant = payload.variantId
    ? item.variants.find((v) => v.id === payload.variantId)
    : null;

  const cartItem: CartItem = {
    uuid: "", // assigned by store on add
    menuItemId: payload.menuItemId,
    name: item.item.name,
    imageUrl: item.item.imageUrl,
    basePrice: Number(item.item.basePrice),
    variantId: variant?.id ?? null,
    variantName: variant?.name ?? null,
    variantPrice: variant ? Number(variant.price) : null,
    modifiers: payload.selectedModifiers,
    quantity: payload.quantity,
    unitPrice: 0, // computed below
  };
  cartItem.unitPrice = computeUnitPrice(cartItem);
  return cartItem;
}

// --- Component ---

export function RestaurantMenu({ menu, branchSlug }: RestaurantMenuProps) {
  const categoryIds = useMemo(() => menu.map((c) => c.category.id), [menu]);

  const categories = useMemo(
    () => menu.map((c) => ({ id: c.category.id, name: c.category.name })),
    [menu],
  );

  const { activeCategoryId, registerSection } =
    useCategoryObserver(categoryIds);

  const [, setActiveCategoryIdOverride] = useState<string | null>(null);

  // Cart store
  const cartItems = useCartItems();
  const cartTotal = useCartTotal();
  const cartItemCount = useCartItemCount();
  const {
    addItem,
    updateQuantity,
    removeItem,
    updateItem,
    clearCart,
    setBranch,
  } = useCartActions();

  // Set branch on mount
  useEffect(() => {
    setBranch(branchSlug);
  }, [branchSlug, setBranch]);

  // Compute menuItemId → total cart quantity
  const cartQuantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const ci of cartItems) {
      map.set(ci.menuItemId, (map.get(ci.menuItemId) ?? 0) + ci.quantity);
    }
    return map;
  }, [cartItems]);

  // Build a flat lookup of all menu items by ID
  const menuItemsById = useMemo(() => {
    const map = new Map<string, MenuItemWithDetails>();
    for (const { items } of menu) {
      for (const item of items) {
        map.set(item.item.id, item);
      }
    }
    return map;
  }, [menu]);

  // Menu item sheet state
  const [selectedItem, setSelectedItem] = useState<MenuItemWithDetails | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [editingCartUuid, setEditingCartUuid] = useState<string | null>(null);

  // Search sheet state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cart drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout sheet state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutSubmitting, setIsCheckoutSubmitting] = useState(false);

  // Order confirmation state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategoryIdOverride(categoryId);
  }, []);

  const handleItemSelect = useCallback((item: MenuItemWithDetails) => {
    setSelectedItem(item);
    setSheetMode("add");
    setEditingCartUuid(null);
    setIsSheetOpen(true);
  }, []);

  const handleItemQuickAdd = useCallback(
    (item: MenuItemWithDetails) => {
      const cartItem = buildSimpleCartItem(item);
      addItem(cartItem);
      toast.success(`${item.item.name} added`);
    },
    [addItem],
  );

  const handleSheetSubmit = useCallback(
    (payload: MenuItemSheetPayload) => {
      if (!selectedItem) return;

      if (sheetMode === "edit" && editingCartUuid) {
        const updated = buildCartItemFromPayload(selectedItem, payload);
        updateItem(editingCartUuid, updated);
        toast.success("Cart updated");
      } else {
        const cartItem = buildCartItemFromPayload(selectedItem, payload);
        addItem(cartItem);
        toast.success(`${selectedItem.item.name} added`);
      }

      setIsSheetOpen(false);
    },
    [selectedItem, sheetMode, editingCartUuid, addItem, updateItem],
  );

  // Inline quantity: increase
  const handleItemIncrease = useCallback(
    (item: MenuItemWithDetails) => {
      // If item has variants/modifiers, must go through sheet
      if (item.variants.length > 0 || item.modifierGroups.length > 0) {
        handleItemSelect(item);
        return;
      }
      // Find existing cart entry for this simple item and increment
      const existing = cartItems.find((ci) => ci.menuItemId === item.item.id);
      if (existing) {
        updateQuantity(existing.uuid, existing.quantity + 1);
      } else {
        handleItemQuickAdd(item);
      }
    },
    [cartItems, updateQuantity, handleItemSelect, handleItemQuickAdd],
  );

  // Inline quantity: decrease
  const handleItemDecrease = useCallback(
    (item: MenuItemWithDetails) => {
      // Find the first cart entry for this item and decrement
      const existing = cartItems.find((ci) => ci.menuItemId === item.item.id);
      if (existing) {
        updateQuantity(existing.uuid, existing.quantity - 1);
      }
    },
    [cartItems, updateQuantity],
  );

  // Cart drawer: edit item → reopen sheet
  const handleCartEdit = useCallback(
    (uuid: string) => {
      const cartItem = cartItems.find((ci) => ci.uuid === uuid);
      if (!cartItem) return;

      const menuItem = menuItemsById.get(cartItem.menuItemId);
      if (!menuItem) return;

      setSelectedItem(menuItem);
      setSheetMode("edit");
      setEditingCartUuid(uuid);
      setIsCartOpen(false);
      setIsSheetOpen(true);
    },
    [cartItems, menuItemsById],
  );

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const handleCheckoutSubmit = useCallback(
    async (_payload: CheckoutSubmitPayload) => {
      setIsCheckoutSubmitting(true);
      try {
        // TODO: Replace with order.create tRPC mutation when order module exists
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const orderId = crypto.randomUUID().slice(0, 8).toUpperCase();

        setIsCheckoutOpen(false);
        clearCart();
        setConfirmedOrderId(orderId);
        setIsConfirmationOpen(true);
      } catch {
        toast.error("Failed to place order. Please try again.");
      } finally {
        setIsCheckoutSubmitting(false);
      }
    },
    [clearCart],
  );

  return (
    <div data-slot="restaurant-menu">
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={handleCategorySelect}
        onSearchOpen={handleSearchOpen}
      />

      <MenuSectionList
        menu={menu}
        registerSection={registerSection}
        onItemSelect={handleItemSelect}
        onItemQuickAdd={handleItemQuickAdd}
        cartQuantities={cartQuantities}
        onItemIncrease={handleItemIncrease}
        onItemDecrease={handleItemDecrease}
      />

      <MenuItemSheet
        item={selectedItem}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={sheetMode}
        onSubmit={handleSheetSubmit}
      />

      <MenuSearchSheet
        menu={menu}
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onItemSelect={handleItemSelect}
      />

      <CartFloatingButton
        itemCount={cartItemCount}
        total={cartTotal}
        onClick={() => setIsCartOpen(true)}
      />

      <CartDrawer
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        items={cartItems}
        subtotal={cartTotal}
        itemCount={cartItemCount}
        onQuantityChange={updateQuantity}
        onRemove={removeItem}
        onEdit={handleCartEdit}
        onCheckout={handleCheckout}
        onClearCart={clearCart}
      />

      <CheckoutSheet
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        items={cartItems}
        subtotal={cartTotal}
        itemCount={cartItemCount}
        onSubmit={handleCheckoutSubmit}
        isSubmitting={isCheckoutSubmitting}
      />

      <OrderConfirmationSheet
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        orderId={confirmedOrderId}
        branchSlug={branchSlug}
      />
    </div>
  );
}
