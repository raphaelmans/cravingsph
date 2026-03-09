"use client";

import { ShoppingCart } from "lucide-react";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CartFloatingButtonProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

export function CartFloatingButton({
  itemCount,
  total,
  onClick,
}: CartFloatingButtonProps) {
  if (itemCount === 0) return null;

  return (
    <div
      data-slot="cart-floating-button"
      className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <Button
        type="button"
        shape="pill"
        size="lg"
        className="w-full shadow-lg"
        onClick={onClick}
      >
        <div className="relative mr-1">
          <ShoppingCart className="size-5" />
          <Badge className="absolute -top-2 -right-2.5 size-4 p-0 text-[10px]">
            {itemCount}
          </Badge>
        </div>
        <span>View Cart</span>
        <span className="mx-1">·</span>
        <Price amount={total} className="text-primary-foreground text-sm" />
      </Button>
    </div>
  );
}
