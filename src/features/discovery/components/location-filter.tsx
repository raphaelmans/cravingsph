"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LocationOption {
  city: string;
  slug: string;
  province?: string | null;
  count?: number;
}

interface LocationFilterProps {
  value: string;
  onChange: (location: string) => void;
  /** Dynamic locations from discovery.locations. Falls back to empty. */
  locations?: LocationOption[];
}

export function LocationFilter({
  value,
  onChange,
  locations = [],
}: LocationFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto gap-2 rounded-full">
        <MapPin className="size-3.5" />
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All locations</SelectItem>
        {locations.map((loc) => (
          <SelectItem key={loc.slug} value={loc.city}>
            {loc.city}
            {loc.count != null ? ` (${loc.count})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
