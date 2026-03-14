"use client";

import { Heart, MapPinned } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { appRoutes } from "@/common/app-routes";
import { useSetPageHeader } from "@/components/layout/page-header-context";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/features/profile";
import { useSavedRestaurants } from "../hooks/use-saved-restaurants";
import { SavedRestaurantCard } from "./saved-restaurant-card";

export function SavedRestaurantsPage() {
  useSetPageHeader({ title: "Saved restaurants", label: "Retention" });
  const { data: profile } = useProfile();
  const { restaurants, stats, unsaveRestaurant, isLoading } =
    useSavedRestaurants();

  function handleUnsave(restaurantId: string, restaurantName: string) {
    unsaveRestaurant(restaurantId);
    toast.success(`${restaurantName} removed from your saved restaurants.`);
  }

  return (
    <div className="min-h-dvh bg-linear-to-b from-peach via-background to-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-6">
        <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm md:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Heart className="size-5" />
            </div>
            <div className="min-w-0 space-y-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
                {profile?.displayName
                  ? `${profile.displayName.split(" ")[0]}'s saved restaurants`
                  : "Saved restaurants"}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {stats.totalSaved} saved
              </p>
            </div>
          </div>
        </section>

        {isLoading ? (
          <output
            aria-label="Loading saved restaurants"
            className="flex items-center justify-center py-16"
          >
            <Spinner className="text-primary" />
          </output>
        ) : restaurants.length > 0 ? (
          <section className="space-y-4">
            {restaurants.map((restaurant) => (
              <SavedRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onUnsave={() =>
                  handleUnsave(restaurant.restaurantId, restaurant.name)
                }
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
            <EmptyContent className="flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild shape="pill">
                <Link href={appRoutes.search.base}>Browse restaurants</Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinned className="size-4 text-primary" />
                Start with discovery or scan a QR menu to save a new favorite.
              </span>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
