"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CuisineFilter } from "@/features/discovery/components/cuisine-filter";
import { LocationFilter } from "@/features/discovery/components/location-filter";
import { RestaurantCard } from "@/features/discovery/components/restaurant-card";
import { useTRPC } from "@/trpc/client";

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

  const { data: results = [], isLoading } = useQuery(
    trpc.discovery.search.queryOptions({
      query: query || undefined,
      cuisine: cuisine || undefined,
      city: location || undefined,
    }),
  );

  const { data: locations = [] } = useQuery(
    trpc.discovery.locations.queryOptions(),
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

  const hasFilters = query || cuisine || location;

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
            locations={locations}
          />
        </div>

        <CuisineFilter
          value={cuisine}
          onChange={(v) => updateParams({ cuisine: v })}
        />
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {hasFilters ? (
              <p className="mb-3 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {query ? ` for "${query}"` : ""}
                {cuisine ? ` in ${cuisine.replace(/-/g, " ")}` : ""}
              </p>
            ) : null}

            {results.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.slug}
                    restaurant={restaurant}
                  />
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
          </>
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
