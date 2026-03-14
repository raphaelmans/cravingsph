"use client";

import { ShoppingBag } from "lucide-react";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CartItem as CartItemType } from "../stores/cart.store";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItemType[];
  subtotal: number;
  itemCount: number;
  onQuantityChange: (uuid: string, quantity: number) => void;
  onRemove: (uuid: string) => void;
  onEdit: (uuid: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  subtotal,
  itemCount,
  onQuantityChange,
  onRemove,
  onEdit,
  onCheckout,
  onClearCart,
}: CartDrawerProps) {
  const isEmpty = items.length === 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle className="font-heading text-xl font-semibold tracking-tight">
            Your cart
          </DrawerTitle>
          {!isEmpty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={onClearCart}
            >
              Clear all
            </Button>
          )}
        </DrawerHeader>

        {isEmpty ? (
          <div className="px-4 pb-4">
            <AppEmptyState
              icon={<ShoppingBag />}
              title="Your cart is empty"
              description="Add items from the menu to get started"
              tone="warm"
            />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="divide-y px-4">
                {items.map((item) => (
                  <CartItem
                    key={item.uuid}
                    item={item}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                    onEdit={onEdit}
                  />
                ))}
              </div>
            </ScrollArea>

            <CartSummary subtotal={subtotal} itemCount={itemCount} />

            <DrawerFooter>
              <Button
                type="button"
                shape="pill"
                size="lg"
                className="w-full"
                onClick={onCheckout}
              >
                Checkout
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
