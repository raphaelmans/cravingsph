"use client";

import { useCallback } from "react";
import { EmptyState } from "@/components/brand/empty-state";
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
}

export function MenuSectionList({
  menu,
  registerSection,
  onItemSelect,
  onItemQuickAdd,
}: MenuSectionListProps) {
  const sectionRef = useCallback(
    (categoryId: string) => (el: HTMLElement | null) => {
      registerSection(categoryId, el);
    },
    [registerSection],
  );

  if (menu.length === 0) {
    return <EmptyState title="No menu items yet" className="mt-8" />;
  }

  return (
    <div data-slot="menu-section-list" className="px-4 pb-24 pt-2">
      {menu.map(({ category, items }) => (
        <section
          key={category.id}
          ref={sectionRef(category.id)}
          data-category-id={category.id}
          className="scroll-mt-[100px]"
        >
          <h2 className="pb-2 pt-4 text-base font-semibold first:pt-2">
            {category.name}
          </h2>
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No items in this category
            </p>
          ) : (
            <div className="divide-y">
              {items.map((menuItem) => (
                <MenuItemCard
                  key={menuItem.item.id}
                  menuItem={menuItem}
                  onSelect={onItemSelect}
                  onQuickAdd={onItemQuickAdd}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
