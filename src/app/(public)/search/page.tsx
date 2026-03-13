"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Search,
  SearchX,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CuisineFilter } from "@/features/discovery/components/cuisine-filter";
import { FoodSearchResults } from "@/features/discovery/components/food-search-results";
import { LocationFilter } from "@/features/discovery/components/location-filter";
import { RestaurantCard } from "@/features/discovery/components/restaurant-card";
import { useTRPC } from "@/trpc/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchMode = "restaurant" | "food";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();

  const query = searchParams.get("q") ?? "";
  const cuisine = searchParams.get("cuisine") ?? "";
  const location = searchParams.get("location") ?? "";
  const mode: SearchMode =
    searchParams.get("mode") === "food" ? "food" : "restaurant";

  // Restaurant search (only when in restaurant mode)
  const { data: restaurantResults = [], isLoading: isLoadingRestaurants } =
    useQuery({
      ...trpc.discovery.search.queryOptions({
        query: query || undefined,
        cuisine: cuisine || undefined,
        city: location || undefined,
      }),
      enabled: mode === "restaurant",
    });

  // Food search (only when in food mode with a query)
  const { data: foodResults = [], isLoading: isLoadingFood } = useQuery({
    ...trpc.discovery.searchFood.queryOptions({
      query: query,
      limit: 20,
    }),
    enabled: mode === "food" && query.length > 0,
  });

  const { data: locations = [] } = useQuery(
    trpc.discovery.locations.queryOptions(),
  );

  const isLoading =
    mode === "restaurant" ? isLoadingRestaurants : isLoadingFood;

  // Build new URL preserving existing params
  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? "";
    updateParams({ q: value });
  }

  function handleModeChange(newMode: SearchMode) {
    updateParams({ mode: newMode === "restaurant" ? "" : newMode });
  }

  const hasFilters = query || cuisine || location;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header + search bar */}
      <div className="sticky top-0 z-30 border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder={
                mode === "food"
                  ? "Search for dishes..."
                  : "Search restaurants or dishes..."
              }
              shape="pill"
              className="pl-10"
              defaultValue={query}
              key={query}
              autoFocus
            />
          </form>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 pb-2">
          {/* Mode toggle */}
          <div className="flex shrink-0 rounded-full border bg-muted p-0.5">
            <button
              type="button"
              onClick={() => handleModeChange("restaurant")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === "restaurant"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Restaurants
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("food")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                mode === "food"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Food
            </button>
          </div>

          {/* Location filter (restaurant mode only) */}
          {mode === "restaurant" && (
            <LocationFilter
              value={location || "all"}
              onChange={(v) => updateParams({ location: v === "all" ? "" : v })}
              locations={locations}
            />
          )}
        </div>

        {/* Cuisine filter (restaurant mode only) */}
        {mode === "restaurant" && (
          <CuisineFilter
            value={cuisine}
            onChange={(v) => updateParams({ cuisine: v })}
          />
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {mode === "food" ? (
          <FoodModeResults
            query={query}
            results={foodResults}
            isLoading={isLoading}
          />
        ) : (
          <RestaurantModeResults
            query={query}
            cuisine={cuisine}
            hasFilters={!!hasFilters}
            results={restaurantResults}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Restaurant mode results
// ---------------------------------------------------------------------------

function RestaurantModeResults({
  query,
  cuisine,
  hasFilters,
  results,
  isLoading,
}: {
  query: string;
  cuisine: string;
  hasFilters: boolean;
  results: Array<{
    id: string;
    slug: string;
    name: string;
    coverImageUrl: string | null;
    logoUrl: string | null;
    cuisineTypes: string[];
    popularItems: string[];
    branchCity: string | null;
  }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {hasFilters ? (
        <p className="mb-3 text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? "s" : ""}
          {query ? ` for "${query}"` : ""}
          {cuisine ? ` in ${cuisine.replace(/-/g, " ")}` : ""}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <EmptyState message="No restaurants found" />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Food mode results
// ---------------------------------------------------------------------------

function FoodModeResults({
  query,
  results,
  isLoading,
}: {
  query: string;
  results: Array<{
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    coverUrl: string | null;
    cuisineTypes: string[];
    branchCity: string | null;
    branchBarangay: string | null;
    matchedItems: Array<{
      name: string;
      basePrice: string;
      imageUrl: string | null;
    }>;
  }>;
  isLoading: boolean;
}) {
  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Search for a dish</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Type a dish name to find restaurants that serve it.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyState message="No dishes found" />;
  }

  const totalItems = results.reduce((sum, r) => sum + r.matchedItems.length, 0);

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {totalItems} dish{totalItems !== 1 ? "es" : ""} across {results.length}{" "}
        restaurant{results.length !== 1 ? "s" : ""} for "{query}"
      </p>
      <FoodSearchResults results={results} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">{message}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search term or adjust your filters.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suspense fallback
// ---------------------------------------------------------------------------

function SearchPageFallback() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30 border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search restaurants or dishes..."
              shape="pill"
              className="pl-10"
              readOnly
              value=""
            />
          </div>
        </div>

        <div className="px-4 pb-3 text-sm text-muted-foreground">
          Loading search filters...
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
