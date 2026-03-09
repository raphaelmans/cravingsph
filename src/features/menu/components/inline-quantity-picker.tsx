"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InlineQuantityPickerProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function InlineQuantityPicker({
  quantity,
  onIncrease,
  onDecrease,
}: InlineQuantityPickerProps) {
  return (
    <fieldset
      data-slot="inline-quantity-picker"
      className="flex items-center gap-1 border-none p-0 m-0 min-w-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <legend className="sr-only">Quantity controls</legend>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        shape="pill"
        aria-label="Decrease quantity"
        onClick={onDecrease}
      >
        <Minus className="size-3.5" />
      </Button>

      <span className="w-6 text-center text-xs font-medium tabular-nums">
        {quantity}
      </span>

      <Button
        type="button"
        variant="default"
        size="icon-sm"
        shape="pill"
        aria-label="Increase quantity"
        onClick={onIncrease}
      >
        <Plus className="size-3.5" />
      </Button>
    </fieldset>
  );
}
