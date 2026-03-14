"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Search,
  SearchX,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useRef } from "react";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarangayFilter } from "@/features/discovery/components/barangay-filter";
import { CuisineFilter } from "@/features/discovery/components/cuisine-filter";
import { FoodSearchResults } from "@/features/discovery/components/food-search-results";
import { LocationFilter } from "@/features/discovery/components/location-filter";
import { RestaurantCard } from "@/features/discovery/components/restaurant-card";
import { useTRPC } from "@/trpc/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchMode = "food" | "restaurant";

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
  const barangay = searchParams.get("barangay") ?? "";
  const mode: SearchMode =
    searchParams.get("mode") === "restaurant" ? "restaurant" : "food";

  // Restaurant search (only when in restaurant mode)
  const { data: restaurantResults = [], isLoading: isLoadingRestaurants } =
    useQuery({
      ...trpc.discovery.search.queryOptions({
        query: query || undefined,
        cuisine: cuisine || undefined,
        city: location || undefined,
        barangay: barangay || undefined,
      }),
      enabled: mode === "restaurant",
    });

  // Food search (only when in food mode with a query)
  const { data: foodResults = [], isLoading: isLoadingFood } = useQuery({
    ...trpc.discovery.searchFood.queryOptions({
      query: query,
      barangay: barangay || undefined,
      limit: 20,
    }),
    enabled: mode === "food" && query.length > 0,
  });

  const { data: locations = [] } = useQuery(
    trpc.discovery.locations.queryOptions(),
  );

  const { data: barangays = [] } = useQuery(
    trpc.discovery.barangays.queryOptions(),
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
    updateParams({ mode: newMode === "food" ? "" : newMode });
  }

  const hasFilters = query || cuisine || location || barangay;

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip">
      {/* Header + search bar */}
      <div className="sticky top-0 z-30 overflow-x-clip border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-2"
            aria-label="Search"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                aria-label="Search restaurants and dishes"
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
            </div>
            <Button
              type="submit"
              size="icon"
              shape="pill"
              aria-label="Apply search"
              title="Apply search"
            >
              <Search className="size-4" />
            </Button>
          </form>
        </div>

        {/* Filter bar */}
        <div className="overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2">
            {/* Mode toggle */}
            <div
              role="tablist"
              aria-label="Search mode"
              className="flex shrink-0 rounded-full border bg-muted p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "food"}
                onClick={() => handleModeChange("food")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "food"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Food
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "restaurant"}
                onClick={() => handleModeChange("restaurant")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "restaurant"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Restaurants
              </button>
            </div>

            {/* Location filter (restaurant mode only) */}
            {mode === "restaurant" && (
              <LocationFilter
                value={location || "all"}
                onChange={(v) =>
                  updateParams({ location: v === "all" ? "" : v })
                }
                locations={locations}
              />
            )}

            {/* Barangay filter (both modes) */}
            <BarangayFilter
              value={barangay || "all"}
              onChange={(v) => updateParams({ barangay: v === "all" ? "" : v })}
              barangays={barangays}
            />
          </div>
        </div>

        {/* Cuisine filter (restaurant mode only) */}
        {mode === "restaurant" && (
          <CuisineFilter
            value={cuisine}
            onChange={(v) => updateParams({ cuisine: v })}
          />
        )}

        <AppliedSearchChips
          query={query}
          cuisine={cuisine}
          location={location}
          barangay={barangay}
          onClear={(key) => updateParams({ [key]: "" })}
          onClearAll={() =>
            updateParams({
              q: "",
              cuisine: "",
              location: "",
              barangay: "",
            })
          }
        />
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0 px-4 py-4">
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
// Applied chips
// ---------------------------------------------------------------------------

function AppliedSearchChips({
  query,
  cuisine,
  location,
  barangay,
  onClear,
  onClearAll,
}: {
  query: string;
  cuisine: string;
  location: string;
  barangay: string;
  onClear: (key: "q" | "cuisine" | "location" | "barangay") => void;
  onClearAll: () => void;
}) {
  const chips = [
    query
      ? {
          key: "q" as const,
          label: `Search: ${query}`,
        }
      : null,
    cuisine
      ? {
          key: "cuisine" as const,
          label: `Cuisine: ${cuisine.replace(/-/g, " ")}`,
        }
      : null,
    location
      ? {
          key: "location" as const,
          label: `Location: ${location}`,
        }
      : null,
    barangay
      ? {
          key: "barangay" as const,
          label: `Barangay: ${barangay}`,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: "q" | "cuisine" | "location" | "barangay";
    label: string;
  }>;

  if (chips.length === 0) return null;

  return (
    <div className="overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-2">
        {chips.map((chip) => (
          <Button
            key={chip.key}
            type="button"
            variant="outline"
            size="sm"
            shape="pill"
            className="max-w-[18rem] justify-start gap-1.5 truncate"
            onClick={() => onClear(chip.key)}
            title={`Remove ${chip.label}`}
          >
            <span className="truncate">{chip.label}</span>
            <X className="size-3.5" />
          </Button>
        ))}

        {chips.length > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        ) : null}
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
      <output
        aria-label="Loading results"
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </output>
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
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {results.map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <AppEmptyState
          icon={<SearchX />}
          title="No restaurants found"
          description="Try a different search, clear one of the filters, or browse nearby listings instead."
          primaryAction={
            <Button asChild shape="pill">
              <Link href="/search">Clear filters</Link>
            </Button>
          }
          secondaryAction={
            <Button asChild variant="outline" shape="pill">
              <Link href="/">Browse nearby</Link>
            </Button>
          }
        />
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
      <AppEmptyState
        icon={<UtensilsCrossed />}
        title="Search for a dish"
        description="Type a dish name to find restaurants that serve it."
      />
    );
  }

  if (isLoading) {
    return (
      <output
        aria-label="Loading results"
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </output>
    );
  }

  if (results.length === 0) {
    return (
      <AppEmptyState
        icon={<SearchX />}
        title="No dishes found"
        description="Try another dish name, remove the barangay filter, or switch back to restaurant mode."
        primaryAction={
          <Button asChild shape="pill">
            <Link
              href={`/search?mode=restaurant&q=${encodeURIComponent(query)}`}
            >
              Restaurant mode
            </Link>
          </Button>
        }
      />
    );
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
