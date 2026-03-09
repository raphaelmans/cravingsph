"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export function BackButton({ onClick, className }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      shape="pill"
      aria-label="Go back"
      onClick={onClick}
      className={cn("shrink-0", className)}
    >
      <ChevronLeft className="size-5" />
    </Button>
  );
}
