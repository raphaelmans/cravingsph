"use client";

import { Search } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  onSearchOpen?: () => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelect,
  onSearchOpen,
}: CategoryTabsProps) {
  // Auto-scroll active tab into view via callback ref
  const activeTabRef = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const handleSelect = useCallback(
    (categoryId: string) => {
      onSelect(categoryId);

      // Scroll the category section into view
      const section = document.querySelector(
        `[data-category-id="${categoryId}"]`,
      );
      if (section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    },
    [onSelect],
  );

  if (categories.length === 0) return null;

  return (
    <div
      data-slot="category-tabs"
      className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
    >
      <ScrollArea className="w-full">
        <div className="flex items-center gap-2 px-4 py-3">
          {onSearchOpen && (
            <Button
              variant="outline"
              size="icon-sm"
              shape="pill"
              onClick={onSearchOpen}
              aria-label="Search menu"
            >
              <Search className="size-4" />
            </Button>
          )}
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <Button
                key={cat.id}
                ref={isActive ? activeTabRef : undefined}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                shape="pill"
                onClick={() => handleSelect(cat.id)}
                aria-pressed={isActive}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
