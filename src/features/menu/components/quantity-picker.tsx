"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityPickerProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantityPickerProps) {
  return (
    <div data-slot="quantity-picker" className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        shape="pill"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </Button>

      <span className="w-8 text-center text-sm font-medium tabular-nums">
        {value}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        shape="pill"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
