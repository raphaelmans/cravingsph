import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RestaurantCard, type RestaurantPreview } from "./restaurant-card";

interface RestaurantCardListProps {
  title: string;
  restaurants: RestaurantPreview[];
  direction?: "horizontal" | "vertical";
}

export function RestaurantCardList({
  title,
  restaurants,
  direction = "vertical",
}: RestaurantCardListProps) {
  if (restaurants.length === 0) return null;

  return (
    <section data-slot="restaurant-card-list" className="space-y-3">
      <h2 className="px-4 text-lg font-semibold">{title}</h2>

      {direction === "horizontal" ? (
        <ScrollArea className="w-full">
          <div className="flex gap-3 px-4 pb-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.slug} className="w-[260px] shrink-0">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="grid gap-3 px-4 sm:grid-cols-2">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
          ))}
        </div>
      )}
    </section>
  );
}
