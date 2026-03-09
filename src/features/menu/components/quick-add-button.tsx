"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAddButtonProps {
  onClick: () => void;
}

export function QuickAddButton({ onClick }: QuickAddButtonProps) {
  return (
    <Button
      data-slot="quick-add-button"
      variant="default"
      size="icon-sm"
      shape="pill"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Add to cart"
    >
      <Plus className="size-4" />
    </Button>
  );
}
