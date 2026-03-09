"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  FullMenu,
  MenuItemWithDetails,
} from "@/modules/menu/repositories/menu.repository";
import { useCategoryObserver } from "../hooks/use-category-observer";
import { CategoryTabs } from "./category-tabs";
import { MenuItemSheet, type MenuItemSheetPayload } from "./menu-item-sheet";
import { MenuSearchSheet } from "./menu-search-sheet";
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

  // Menu item sheet state
  const [selectedItem, setSelectedItem] = useState<MenuItemWithDetails | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Search sheet state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setActiveCategoryIdOverride(categoryId);
  }, []);

  const handleItemSelect = useCallback((item: MenuItemWithDetails) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  }, []);

  const handleItemQuickAdd = useCallback((item: MenuItemWithDetails) => {
    // Will add to cart in Step 3
    toast.success(`${item.item.name} added`);
  }, []);

  const handleSheetSubmit = useCallback((payload: MenuItemSheetPayload) => {
    // Will add to cart in Step 3
    toast.success("Added to cart");
    setIsSheetOpen(false);
    console.log("Cart payload ready:", payload);
  }, []);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
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

      <MenuItemSheet
        item={selectedItem}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleSheetSubmit}
      />

      <MenuSearchSheet
        menu={menu}
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
}
