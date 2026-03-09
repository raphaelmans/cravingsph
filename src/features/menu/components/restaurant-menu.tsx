"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  FullMenu,
  MenuItemWithDetails,
} from "@/modules/menu/repositories/menu.repository";
import { useCategoryObserver } from "../hooks/use-category-observer";
import { CategoryTabs } from "./category-tabs";
import { MenuSectionList } from "./menu-section-list";

interface RestaurantMenuProps {
  menu: FullMenu;
}

export function RestaurantMenu({ menu }: RestaurantMenuProps) {
  const categoryIds = useMemo(() => menu.map((c) => c.category.id), [menu]);

  const categories = useMemo(
    () => menu.map((c) => ({ id: c.category.id, name: c.category.name })),
    [menu],
  );

  const { activeCategoryId, registerSection } =
    useCategoryObserver(categoryIds);

  const [, setActiveCategoryIdOverride] = useState<string | null>(null);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategoryIdOverride(categoryId);
  }, []);

  const handleItemSelect = useCallback((_item: MenuItemWithDetails) => {
    // Will open MenuItemSheet in Step 2c
  }, []);

  const handleItemQuickAdd = useCallback((item: MenuItemWithDetails) => {
    // Will add to cart in Step 3
    toast.success(`${item.item.name} added`);
  }, []);

  const handleSearchOpen = useCallback(() => {
    // Will open MenuSearchSheet in Step 2d
  }, []);

  return (
    <div data-slot="restaurant-menu">
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={handleCategorySelect}
        onSearchOpen={handleSearchOpen}
      />

      <MenuSectionList
        menu={menu}
        registerSection={registerSection}
        onItemSelect={handleItemSelect}
        onItemQuickAdd={handleItemQuickAdd}
      />
    </div>
  );
}
