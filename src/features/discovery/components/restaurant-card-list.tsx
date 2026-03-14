import { MapPinned } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/brand/empty-state";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RestaurantCard, type RestaurantPreview } from "./restaurant-card";

interface RestaurantCardListProps {
  title: string;
  description?: string;
  restaurants: RestaurantPreview[];
  direction?: "horizontal" | "vertical";
  seeAllHref?: string;
}

export function RestaurantCardList({
  title,
  description,
  restaurants,
  direction = "vertical",
  seeAllHref,
}: RestaurantCardListProps) {
  return (
    <div
      data-slot="restaurant-card-list"
      className="mx-auto max-w-6xl space-y-4"
    >
      <div className="flex flex-col gap-2 px-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {seeAllHref && restaurants.length > 0 ? (
          <Link
            href={seeAllHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            See all
          </Link>
        ) : null}
      </div>

      {restaurants.length === 0 ? (
        <div className="px-4">
          <EmptyState
            icon={<MapPinned />}
            title="No restaurants found"
            description="New restaurants are being added — check back soon."
          />
        </div>
      ) : direction === "horizontal" ? (
        <ScrollArea className="w-full">
          <div className="flex gap-4 px-4 pb-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.slug} className="w-[260px] shrink-0">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="grid gap-4 px-4 sm:grid-cols-2">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
