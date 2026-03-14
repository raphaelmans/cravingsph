"use client";

import { ArrowLeft, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import type {
  FullMenu,
  MenuItemWithDetails,
} from "@/modules/menu/repositories/menu.repository";
import { MenuItemCard } from "./menu-item-card";

interface MenuSearchSheetProps {
  menu: FullMenu;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect: (item: MenuItemWithDetails) => void;
}

// --- Fuzzy matching ---

function matchesQuery(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.every((w) => lower.includes(w));
}

function searchMenu(menu: FullMenu, query: string): MenuItemWithDetails[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return [];

  const words = trimmed.split(/\s+/);
  const results: MenuItemWithDetails[] = [];

  for (const { category, items } of menu) {
    // If query matches category name, include all items in that category
    if (matchesQuery(category.name, words)) {
      results.push(...items);
      continue;
    }

    // Otherwise, check each item's name and description
    for (const menuItem of items) {
      const searchable = [
        menuItem.item.name,
        menuItem.item.description ?? "",
      ].join(" ");

      if (matchesQuery(searchable, words)) {
        results.push(menuItem);
      }
    }
  }

  return results;
}

// --- Component ---

export function MenuSearchSheet({
  menu,
  open,
  onOpenChange,
  onItemSelect,
}: MenuSearchSheetProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchMenu(menu, deferredQuery),
    [menu, deferredQuery],
  );

  const hasQuery = deferredQuery.trim().length > 0;

  // Reset query when sheet closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure drawer animation has started
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleItemSelect = (item: MenuItemWithDetails) => {
    onOpenChange(false);
    onItemSelect(item);
  };

  return (
    <Drawer direction="top" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[100vh] rounded-b-none border-b-0">
        <DrawerTitle className="sr-only">Search menu</DrawerTitle>

        {/* Search header */}
        <div className="flex items-center gap-2.5 border-b border-primary/10 px-4 py-2">
          <DrawerClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close search"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </DrawerClose>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              shape="pill"
              placeholder="Search for food or drink"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {hasQuery && results.length > 0 && (
            <div className="flex flex-col">
              {results.map((menuItem) => (
                <MenuItemCard
                  key={menuItem.item.id}
                  menuItem={menuItem}
                  onSelect={handleItemSelect}
                  onQuickAdd={handleItemSelect}
                />
              ))}
            </div>
          )}

          {hasQuery && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No menu items match your search.
            </p>
          )}

          {!hasQuery && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Type to search the menu
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
