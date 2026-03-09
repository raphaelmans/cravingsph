"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderRecord } from "../types";

/** Valid forward-only transitions per status */
const NEXT_STATUSES: Partial<
  Record<
    OrderRecord["status"],
    { value: OrderRecord["status"]; label: string }[]
  >
> = {
  accepted: [
    { value: "preparing", label: "Mark as Preparing" },
    { value: "ready", label: "Mark as Ready" },
  ],
  preparing: [
    { value: "ready", label: "Mark as Ready" },
    { value: "completed", label: "Mark as Completed" },
  ],
  ready: [{ value: "completed", label: "Mark as Completed" }],
};

interface StatusUpdateDropdownProps {
  orderId: string;
  currentStatus: OrderRecord["status"];
  isPending?: boolean;
  onStatusChange: (orderId: string, newStatus: OrderRecord["status"]) => void;
}

export function StatusUpdateDropdown({
  orderId,
  currentStatus,
  isPending,
  onStatusChange,
}: StatusUpdateDropdownProps) {
  const options = NEXT_STATUSES[currentStatus];

  if (!options || options.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={isPending}>
          {isPending ? "Updating..." : "Update Status"}
          <ChevronDown className="ml-1 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onStatusChange(orderId, opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
