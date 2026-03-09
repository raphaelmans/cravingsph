"use client";

import { Armchair, ShoppingBag } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type OrderType = "dine-in" | "pickup";

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as OrderType)}
      className="grid grid-cols-2 gap-3"
    >
      <Label
        htmlFor="order-type-dine-in"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
        data-selected={value === "dine-in"}
      >
        <Armchair className="size-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <RadioGroupItem value="dine-in" id="order-type-dine-in" />
          <span className="text-sm font-medium">Dine-in</span>
        </div>
      </Label>

      <Label
        htmlFor="order-type-pickup"
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
        data-selected={value === "pickup"}
      >
        <ShoppingBag className="size-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <RadioGroupItem value="pickup" id="order-type-pickup" />
          <span className="text-sm font-medium">Pickup</span>
        </div>
      </Label>
    </RadioGroup>
  );
}
