"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CUISINE_OPTIONS } from "./cuisine-pill";

interface CuisineFilterProps {
  value: string;
  onChange: (cuisine: string) => void;
}

export function CuisineFilter({ value, onChange }: CuisineFilterProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 px-4 pb-2">
        <Button
          variant={value === "" ? "default" : "outline"}
          shape="pill"
          size="sm"
          className="shrink-0"
          onClick={() => onChange("")}
        >
          All
        </Button>
        {CUISINE_OPTIONS.map((cuisine) => (
          <Button
            key={cuisine.slug}
            variant={value === cuisine.slug ? "default" : "outline"}
            shape="pill"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => onChange(value === cuisine.slug ? "" : cuisine.slug)}
          >
            <span aria-hidden="true">{cuisine.emoji}</span>
            {cuisine.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
