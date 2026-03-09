"use client";

import { ArrowLeft, Heart, MapPinned, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useProfile } from "@/features/profile";
import { useSavedRestaurants } from "../hooks/use-saved-restaurants";
import { SavedRestaurantCard } from "./saved-restaurant-card";

export function SavedRestaurantsPage() {
  const { data: profile } = useProfile();
  const { restaurants, stats, unsaveRestaurant } = useSavedRestaurants();

  function handleUnsave(slug: string, restaurantName: string) {
    unsaveRestaurant(slug);
    toast.success(`${restaurantName} removed from your saved restaurants.`);
  }

  return (
    <main className="min-h-dvh bg-linear-to-b from-[#fff8f2] via-background to-background pb-24">
      <header className="sticky top-0 z-20 border-b border-primary/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
          <Link
            href={appRoutes.index.base}
            className="flex size-10 items-center justify-center rounded-full border border-primary/10 bg-background text-primary transition-colors hover:bg-primary/5"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              Retention
            </p>
            <h1 className="font-heading text-xl font-bold">
              Saved restaurants
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-6">
        <section className="overflow-hidden rounded-[32px] border border-primary/15 bg-linear-to-br from-primary/[0.18] via-background to-background p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                <Sparkles className="size-3.5" />
                Quick return list
              </p>
              <div>
                <h2 className="font-heading text-2xl font-bold">
                  {profile?.displayName
                    ? `${profile.displayName.split(" ")[0]}'s favorite stops`
                    : "Your favorite stops"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Keep the restaurants you trust close to checkout, reorder from
                  familiar kitchens, and trim the list whenever your cravings
                  change.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-72 sm:grid-cols-3 sm:self-stretch">
              <div className="rounded-[24px] bg-background/85 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Saved now</p>
                <p className="mt-2 font-heading text-3xl font-bold">
                  {stats.totalSaved}
                </p>
              </div>
              <div className="rounded-[24px] bg-background/85 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Cuisine mix</p>
                <p className="mt-2 font-heading text-3xl font-bold">
                  {stats.cuisineCount}
                </p>
              </div>
              <div className="rounded-[24px] bg-background/85 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Added this week</p>
                <p className="mt-2 font-heading text-3xl font-bold">
                  {stats.recentlySavedCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {restaurants.length > 0 ? (
          <section className="space-y-4">
            {restaurants.map((restaurant) => (
              <SavedRestaurantCard
                key={restaurant.slug}
                restaurant={restaurant}
                onUnsave={() => handleUnsave(restaurant.slug, restaurant.name)}
              />
            ))}
          </section>
        ) : (
          <Empty className="border-primary/15 bg-background">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Heart />
              </EmptyMedia>
              <EmptyTitle>No saved restaurants yet</EmptyTitle>
              <EmptyDescription>
                Restaurants you mark for later will show up here for quick
                return visits and easier repeat ordering.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={appRoutes.search.base}
                className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Browse restaurants
              </Link>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinned className="size-4 text-primary" />
                Start with discovery or scan a QR menu to save a new favorite.
              </span>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </main>
  );
}
