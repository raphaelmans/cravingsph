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
      className="fixed inset-x-0 bottom-16 z-40 p-4 md:inset-x-auto md:bottom-6 md:right-6 md:w-auto md:p-0"
    >
      <Button
        type="button"
        shape="pill"
        size="lg"
        className="w-full shadow-lg md:w-auto md:min-w-[15rem]"
        onClick={onClick}
      >
        <div className="relative mr-1">
          <ShoppingCart className="size-5" />
          <Badge className="absolute -top-2 -right-2.5 size-4 p-0 text-xs">
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
