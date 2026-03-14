"use client";

import { UtensilsCrossed } from "lucide-react";
import { useCallback } from "react";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import type {
  FullMenu,
  MenuItemWithDetails,
} from "@/modules/menu/repositories/menu.repository";
import { MenuItemCard } from "./menu-item-card";

interface MenuSectionListProps {
  menu: FullMenu;
  registerSection: (id: string, el: HTMLElement | null) => void;
  onItemSelect: (item: MenuItemWithDetails) => void;
  onItemQuickAdd: (item: MenuItemWithDetails) => void;
  /** Map of menuItemId → total quantity in cart */
  cartQuantities?: Map<string, number>;
  onItemIncrease?: (item: MenuItemWithDetails) => void;
  onItemDecrease?: (item: MenuItemWithDetails) => void;
}

export function MenuSectionList({
  menu,
  registerSection,
  onItemSelect,
  onItemQuickAdd,
  cartQuantities,
  onItemIncrease,
  onItemDecrease,
}: MenuSectionListProps) {
  const sectionRef = useCallback(
    (categoryId: string) => (el: HTMLElement | null) => {
      registerSection(categoryId, el);
    },
    [registerSection],
  );

  if (menu.length === 0) {
    return (
      <AppEmptyState
        className="mx-4 mt-8"
        icon={<UtensilsCrossed />}
        tone="warm"
        title="No menu items yet"
        description="This branch has not published menu items yet. Browse another restaurant or come back once the menu is live."
      />
    );
  }

  return (
    <div data-slot="menu-section-list" className="px-4 pb-24 pt-2 md:pb-10">
      {menu.map(({ category, items }) => (
        <section
          key={category.id}
          ref={sectionRef(category.id)}
          data-category-id={category.id}
          className="scroll-mt-[100px]"
        >
          <h2 className="pb-2 pt-4 font-heading text-lg font-semibold tracking-tight first:pt-2">
            {category.name}
          </h2>
          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed py-4 text-center text-sm text-muted-foreground">
              No items in this category
            </p>
          ) : (
            <div className="divide-y">
              {items.map((menuItem) => (
                <MenuItemCard
                  key={menuItem.item.id}
                  menuItem={menuItem}
                  cartQuantity={cartQuantities?.get(menuItem.item.id) ?? 0}
                  onSelect={onItemSelect}
                  onQuickAdd={onItemQuickAdd}
                  onIncrease={onItemIncrease}
                  onDecrease={onItemDecrease}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
