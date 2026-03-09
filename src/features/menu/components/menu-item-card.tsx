"use client";

import Image from "next/image";
import { Price } from "@/components/brand/price";
import type { MenuItemWithDetails } from "@/modules/menu/repositories/menu.repository";
import { InlineQuantityPicker } from "./inline-quantity-picker";
import { QuickAddButton } from "./quick-add-button";

interface MenuItemCardProps {
  menuItem: MenuItemWithDetails;
  cartQuantity?: number;
  onSelect: (item: MenuItemWithDetails) => void;
  onQuickAdd: (item: MenuItemWithDetails) => void;
  onIncrease?: (item: MenuItemWithDetails) => void;
  onDecrease?: (item: MenuItemWithDetails) => void;
}

function getDisplayPrice(menuItem: MenuItemWithDetails): number {
  // If variants exist, show the lowest variant price
  if (menuItem.variants.length > 0) {
    return Math.min(...menuItem.variants.map((v) => Number(v.price)));
  }
  return Number(menuItem.item.basePrice);
}

function hasModifiers(menuItem: MenuItemWithDetails): boolean {
  return menuItem.modifierGroups.length > 0;
}

export function MenuItemCard({
  menuItem,
  cartQuantity = 0,
  onSelect,
  onQuickAdd,
  onIncrease,
  onDecrease,
}: MenuItemCardProps) {
  const { item, variants } = menuItem;
  const price = getDisplayPrice(menuItem);
  const showFromPrice = variants.length > 1;

  return (
    <button
      type="button"
      data-slot="menu-item-card"
      className="flex w-full gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50 active:bg-muted"
      onClick={() => onSelect(menuItem)}
    >
      {/* Thumbnail */}
      {item.imageUrl ? (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ) : (
        <div className="size-20 shrink-0 rounded-md bg-muted" />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="text-sm font-medium leading-tight">{item.name}</h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
        <div className="mt-1">
          {showFromPrice && (
            <span className="text-xs text-muted-foreground">from </span>
          )}
          <Price amount={price} className="text-sm" />
        </div>
      </div>

      {/* Quick add / inline quantity */}
      <div className="flex shrink-0 items-end pb-0.5">
        {cartQuantity > 0 && onIncrease && onDecrease ? (
          <InlineQuantityPicker
            quantity={cartQuantity}
            onIncrease={() => onIncrease(menuItem)}
            onDecrease={() => onDecrease(menuItem)}
          />
        ) : (
          <QuickAddButton
            onClick={() => {
              if (hasModifiers(menuItem) || variants.length > 0) {
                onSelect(menuItem);
              } else {
                onQuickAdd(menuItem);
              }
            }}
          />
        )}
      </div>
    </button>
  );
}
