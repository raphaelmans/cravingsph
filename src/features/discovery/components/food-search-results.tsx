"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/brand/price";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FoodSearchItem {
  name: string;
  basePrice: string;
  imageUrl: string | null;
}

interface FoodSearchResult {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  coverUrl: string | null;
  cuisineTypes: string[];
  branchCity: string | null;
  branchBarangay: string | null;
  matchedItems: FoodSearchItem[];
}

interface FoodSearchResultsProps {
  results: FoodSearchResult[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FoodSearchResults({ results }: FoodSearchResultsProps) {
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      {results.map((restaurant) => (
        <Card
          key={restaurant.id}
          data-slot="food-search-card"
          className="group relative overflow-hidden border border-border/70 bg-background/95 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
        >
          <Link
            href={`/restaurant/${restaurant.slug}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* Cover image */}
            <div className="relative aspect-[3/2] w-full bg-muted">
              {restaurant.coverUrl ? (
                <Image
                  src={restaurant.coverUrl}
                  alt={`${restaurant.name} cover photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 75vw, 300px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-3xl text-muted-foreground/40">
                    {restaurant.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Logo overlay */}
              {restaurant.logoUrl && (
                <div className="absolute -bottom-4 left-3 size-10 overflow-hidden rounded-full border-2 border-background bg-background">
                  <Image
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3 p-4">
              <h3
                className={`font-heading text-base font-semibold leading-tight text-balance ${restaurant.logoUrl ? "mt-2" : ""}`}
              >
                {restaurant.name}
              </h3>

              {/* Location */}
              {(restaurant.branchCity || restaurant.branchBarangay) && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {[restaurant.branchBarangay, restaurant.branchCity]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              {/* Cuisine tags */}
              {restaurant.cuisineTypes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {restaurant.cuisineTypes.slice(0, 3).map((cuisine) => (
                    <Badge key={cuisine} variant="chip">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Matched dishes */}
              {restaurant.matchedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {restaurant.matchedItems.map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      <Price
                        amount={Number(item.basePrice)}
                        className="text-xs"
                      />
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-1 text-sm font-medium text-primary opacity-80 transition-opacity group-hover:opacity-100">
                Open menu
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}

export type { FoodSearchResult, FoodSearchItem, FoodSearchResultsProps };
