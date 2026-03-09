"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Price } from "@/components/brand/price";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { MenuItemWithDetails } from "@/modules/menu/repositories/menu.repository";
import { ModifierGroup } from "./modifier-group";
import { QuantityPicker } from "./quantity-picker";

// --- Types ---

export interface SelectedModifier {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemSheetPayload {
  menuItemId: string;
  variantId?: string;
  selectedModifiers: SelectedModifier[];
  quantity: number;
  totalPrice: number;
}

interface MenuItemSheetProps {
  item: MenuItemWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "add" | "edit";
  onSubmit: (payload: MenuItemSheetPayload) => void;
}

// --- Helpers ---

type ModifierSelections = Map<string, string[]>;

function getInitialVariantId(item: MenuItemWithDetails): string | undefined {
  if (item.variants.length === 0) return undefined;
  // Auto-select first variant
  return item.variants[0].id;
}

function validateModifiers(
  item: MenuItemWithDetails,
  selections: ModifierSelections,
): boolean {
  for (const { group } of item.modifierGroups) {
    const count = selections.get(group.id)?.length ?? 0;
    if (group.isRequired && count < group.minSelections) {
      return false;
    }
  }
  return true;
}

// --- Component ---

export function MenuItemSheet({
  item,
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
}: MenuItemSheetProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(undefined);
  const [modifierSelections, setModifierSelections] =
    useState<ModifierSelections>(new Map());
  const [quantity, setQuantity] = useState(1);

  // Reset state when a new item opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen && item) {
        setSelectedVariantId(getInitialVariantId(item));
        setModifierSelections(new Map());
        setQuantity(1);
      }
      onOpenChange(isOpen);
    },
    [item, onOpenChange],
  );

  const handleModifierChange = useCallback(
    (groupId: string, modifierIds: string[]) => {
      setModifierSelections((prev) => {
        const next = new Map(prev);
        next.set(groupId, modifierIds);
        return next;
      });
    },
    [],
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!item) return 0;

    // Base: variant price or item base price
    let basePrice: number;
    if (selectedVariantId) {
      const variant = item.variants.find((v) => v.id === selectedVariantId);
      basePrice = variant ? Number(variant.price) : Number(item.item.basePrice);
    } else {
      basePrice = Number(item.item.basePrice);
    }

    // Sum selected modifier prices
    let modifierTotal = 0;
    for (const { group, modifiers } of item.modifierGroups) {
      const selectedIds = modifierSelections.get(group.id) ?? [];
      for (const mod of modifiers) {
        if (selectedIds.includes(mod.id)) {
          modifierTotal += Number(mod.price);
        }
      }
    }

    return (basePrice + modifierTotal) * quantity;
  }, [item, selectedVariantId, modifierSelections, quantity]);

  const isValid = useMemo(() => {
    if (!item) return false;
    if (item.variants.length > 0 && !selectedVariantId) return false;
    return validateModifiers(item, modifierSelections);
  }, [item, selectedVariantId, modifierSelections]);

  const handleSubmit = useCallback(() => {
    if (!item || !isValid) return;

    // Collect selected modifiers into flat array
    const selectedModifiers: SelectedModifier[] = [];
    for (const { group, modifiers } of item.modifierGroups) {
      const selectedIds = modifierSelections.get(group.id) ?? [];
      for (const mod of modifiers) {
        if (selectedIds.includes(mod.id)) {
          selectedModifiers.push({
            id: mod.id,
            name: mod.name,
            price: Number(mod.price),
          });
        }
      }
    }

    onSubmit({
      menuItemId: item.item.id,
      variantId: selectedVariantId,
      selectedModifiers,
      quantity,
      totalPrice,
    });
  }, [
    item,
    isValid,
    selectedVariantId,
    modifierSelections,
    quantity,
    totalPrice,
    onSubmit,
  ]);

  if (!item) return null;

  const { item: menuItem, variants, modifierGroups } = item;
  const buttonLabel = mode === "edit" ? "Update cart" : "Add to cart";

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        {/* Back button */}
        <div className="absolute top-6 left-4 z-10">
          <DrawerClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              shape="pill"
              className="bg-background/80 backdrop-blur-sm"
              aria-label="Back to menu"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </DrawerClose>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto">
          {/* Item image */}
          {menuItem.imageUrl && (
            <div className="relative h-48 w-full bg-muted">
              <Image
                src={menuItem.imageUrl}
                alt={menuItem.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          {/* Item info */}
          <div className="space-y-1 px-4 pt-4">
            <DrawerTitle className="text-lg">{menuItem.name}</DrawerTitle>
            {menuItem.description && (
              <p className="text-sm text-muted-foreground">
                {menuItem.description}
              </p>
            )}
            <Price amount={Number(menuItem.basePrice)} className="text-sm" />
          </div>

          <Separator className="my-4" />

          {/* Variant selector */}
          {variants.length > 0 && (
            <>
              <div className="space-y-3 px-4">
                <h3 className="text-sm font-semibold">Size</h3>
                <RadioGroup
                  value={selectedVariantId ?? ""}
                  onValueChange={setSelectedVariantId}
                  className="gap-0"
                >
                  {variants.map((variant) => {
                    const variantPrice = Number(variant.price);
                    return (
                      <Label
                        key={variant.id}
                        htmlFor={variant.id}
                        className="flex cursor-pointer items-center justify-between py-2.5 font-normal"
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={variant.id} id={variant.id} />
                          <span className="text-sm">{variant.name}</span>
                        </div>
                        <Price
                          amount={variantPrice}
                          className="text-xs font-normal"
                        />
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
              <Separator className="my-4" />
            </>
          )}

          {/* Modifier groups */}
          {modifierGroups.length > 0 && (
            <div className="space-y-6 px-4 pb-4">
              {modifierGroups.map(({ group, modifiers }) => (
                <ModifierGroup
                  key={group.id}
                  group={group}
                  modifiers={modifiers}
                  selected={modifierSelections.get(group.id) ?? []}
                  onSelectionChange={handleModifierChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-primary/20 flex-row items-center justify-between">
          <QuantityPicker value={quantity} onChange={setQuantity} />

          <Button
            type="button"
            shape="pill"
            size="lg"
            className="flex-1 ml-4"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            <Price
              amount={totalPrice}
              className="text-primary-foreground text-sm"
            />
            <span className="mx-1">·</span>
            {buttonLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
