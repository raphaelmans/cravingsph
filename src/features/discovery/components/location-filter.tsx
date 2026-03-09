"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFilterProps {
  value: string;
  onChange: (location: string) => void;
}

export interface LocationOption {
  label: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Stub locations — will be replaced by ph-provinces-cities data or tRPC call
// ---------------------------------------------------------------------------
export const LOCATION_OPTIONS: LocationOption[] = [
  { label: "Makati", slug: "makati" },
  { label: "BGC / Taguig", slug: "taguig" },
  { label: "Quezon City", slug: "quezon-city" },
  { label: "Manila", slug: "manila" },
  { label: "Pasig", slug: "pasig" },
  { label: "Mandaluyong", slug: "mandaluyong" },
  { label: "San Juan", slug: "san-juan" },
  { label: "Parañaque", slug: "paranaque" },
  { label: "Las Piñas", slug: "las-pinas" },
  { label: "Muntinlupa", slug: "muntinlupa" },
];

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto gap-1.5 rounded-full">
        <MapPin className="size-3.5" />
        <SelectValue placeholder="Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All locations</SelectItem>
        {LOCATION_OPTIONS.map((location) => (
          <SelectItem key={location.slug} value={location.slug}>
            {location.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
