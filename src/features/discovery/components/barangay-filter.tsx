"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BarangayOption {
  barangay: string;
  slug: string;
  city?: string | null;
  count?: number;
}

interface BarangayFilterProps {
  value: string;
  onChange: (barangay: string) => void;
  /** Dynamic barangays from discovery.barangays. Falls back to empty. */
  barangays?: BarangayOption[];
}

export function BarangayFilter({
  value,
  onChange,
  barangays = [],
}: BarangayFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="max-w-[11rem] shrink-0 gap-2 rounded-full sm:max-w-none">
        <MapPin className="size-3.5" />
        <SelectValue placeholder="Barangay" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All barangays</SelectItem>
        {barangays.map((b) => (
          <SelectItem key={b.slug} value={b.barangay}>
            {b.barangay}
            {b.count != null ? ` (${b.count})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
