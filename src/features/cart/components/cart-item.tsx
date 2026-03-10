"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Price } from "@/components/brand/price";
import { Button } from "@/components/ui/button";
import { QuantityPicker } from "@/features/menu/components/quantity-picker";
import type { CartItem as CartItemType } from "../stores/cart.store";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (uuid: string, quantity: number) => void;
  onRemove: (uuid: string) => void;
  onEdit: (uuid: string) => void;
}

function formatModifierSummary(item: CartItemType): string | null {
  const parts: string[] = [];
  if (item.variantName) parts.push(item.variantName);
  if (item.modifiers.length > 0) {
    parts.push(...item.modifiers.map((m) => m.name));
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onEdit,
}: CartItemProps) {
  const modifierSummary = formatModifierSummary(item);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div data-slot="cart-item" className="flex gap-4 py-4">
      {/* Thumbnail */}
      <button
        type="button"
        className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted"
        onClick={() => onEdit(item.uuid)}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized={!item.imageUrl.includes("supabase.co")}
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </button>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <button
            type="button"
            className="text-left text-sm font-medium leading-tight hover:underline"
            onClick={() => onEdit(item.uuid)}
          >
            {item.name}
          </button>
          {modifierSummary && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {modifierSummary}
            </p>
          )}
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <QuantityPicker
              value={item.quantity}
              onChange={(qty) => onQuantityChange(item.uuid, qty)}
              min={1}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              shape="pill"
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.uuid)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <Price amount={lineTotal} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
