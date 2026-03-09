"use client";

import { ArrowLeft, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CuisineFilter } from "@/features/discovery/components/cuisine-filter";
import { LocationFilter } from "@/features/discovery/components/location-filter";
import type { RestaurantPreview } from "@/features/discovery/components/restaurant-card";
import { RestaurantCard } from "@/features/discovery/components/restaurant-card";

// ---------------------------------------------------------------------------
// Stub data — will be replaced by tRPC search procedure
// ---------------------------------------------------------------------------

const ALL_RESTAURANTS: RestaurantPreview[] = [
  {
    slug: "mang-inasal-sm-north",
    name: "Mang Inasal",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Chicken"],
    popularItems: ["Chicken Inasal Paa", "Pork BBQ", "Halo-Halo"],
  },
  {
    slug: "jollibee-katipunan",
    name: "Jollibee",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Fast Food"],
    popularItems: ["Chickenjoy", "Jolly Spaghetti", "Yumburger"],
  },
  {
    slug: "andoks-commonwealth",
    name: "Andok's",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Chicken"],
    popularItems: ["Litson Manok", "Dokito", "Pork BBQ"],
  },
  {
    slug: "kuya-j-ayala",
    name: "Kuya J Restaurant",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Seafood"],
    popularItems: ["Crispy Pata", "Baked Scallops", "Sinigang na Hipon"],
  },
  {
    slug: "lugawan-sa-kanto",
    name: "Lugawan sa Kanto",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Street Food"],
    popularItems: ["Lugaw", "Tokwa't Baboy", "Goto"],
  },
  {
    slug: "meryendahan-ni-ate",
    name: "Meryendahan ni Ate",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Desserts"],
    popularItems: ["Turon", "Banana Cue", "Biko"],
  },
  {
    slug: "brew-coffee-co",
    name: "Brew Coffee Co.",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Coffee", "Pastries"],
    popularItems: ["Iced Spanish Latte", "Matcha Latte", "Ensaymada"],
  },
  {
    slug: "seafood-dampa",
    name: "Seafood Dampa",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Filipino", "Seafood"],
    popularItems: ["Grilled Bangus", "Sinigang na Salmon", "Kare-Kare"],
  },
  {
    slug: "milk-tea-house",
    name: "Milk Tea House",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["Milk Tea", "Snacks"],
    popularItems: ["Okinawa Milk Tea", "Wintermelon", "Takoyaki"],
  },
  {
    slug: "bbq-masters",
    name: "BBQ Masters",
    coverImageUrl: null,
    logoUrl: null,
    cuisineTypes: ["BBQ", "Filipino"],
    popularItems: ["Pork Belly BBQ", "Chicken Skewers", "Java Rice"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterRestaurants(
  restaurants: RestaurantPreview[],
  query: string,
  cuisine: string,
): RestaurantPreview[] {
  return restaurants.filter((r) => {
    // Text search — match name, cuisine types, or popular items
    if (query) {
      const q = query.toLowerCase();
      const matchesName = r.name.toLowerCase().includes(q);
      const matchesCuisine = r.cuisineTypes.some((c) =>
        c.toLowerCase().includes(q),
      );
      const matchesItems = r.popularItems.some((item) =>
        item.toLowerCase().includes(q),
      );
      if (!matchesName && !matchesCuisine && !matchesItems) return false;
    }

    // Cuisine filter — match any cuisine type slug
    if (cuisine) {
      const matchesCuisineFilter = r.cuisineTypes.some(
        (c) => c.toLowerCase().replace(/\s+/g, "-") === cuisine,
      );
      if (!matchesCuisineFilter) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get("q") ?? "";
  const cuisine = searchParams.get("cuisine") ?? "";
  const location = searchParams.get("location") ?? "";

  const results = useMemo(
    () => filterRestaurants(ALL_RESTAURANTS, query, cuisine),
    [query, cuisine],
  );

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

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Header + search bar */}
      <div className="sticky top-0 z-30 border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-3">
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
              placeholder="Search restaurants or dishes..."
              shape="pill"
              className="pl-10"
              defaultValue={query}
              autoFocus
            />
          </form>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <LocationFilter
            value={location || "all"}
            onChange={(v) => updateParams({ location: v === "all" ? "" : v })}
          />
        </div>

        <CuisineFilter
          value={cuisine}
          onChange={(v) => updateParams({ cuisine: v })}
        />
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {query || cuisine ? (
          <p className="mb-3 text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
            {query ? ` for "${query}"` : ""}
            {cuisine ? ` in ${cuisine.replace(/-/g, " ")}` : ""}
          </p>
        ) : null}

        {results.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((restaurant) => (
              <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <SearchX className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No restaurants found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or adjust your filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchPageFallback() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-30 border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-3">
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
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}
