import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CUISINE_OPTIONS,
  CuisinePill,
} from "@/features/discovery/components/cuisine-pill";
import { HeroSection } from "@/features/discovery/components/hero-section";
import { HowItWorksSection } from "@/features/discovery/components/how-it-works-section";
import { RestaurantCardList } from "@/features/discovery/components/restaurant-card-list";
import { api } from "@/trpc/server";

export default async function HomePage() {
  const caller = await api();
  const [featured, nearby] = await Promise.all([
    caller.discovery.featured({ limit: 6 }),
    caller.discovery.nearby({ limit: 8 }),
  ]);

  return (
    <div data-slot="home-page" className="flex min-h-dvh flex-col">
      {/* Hero */}
      <HeroSection />

      {/* How it works */}
      <HowItWorksSection />

      {/* Cuisine categories */}
      <section data-slot="cuisine-categories" className="py-4">
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-3">
            {CUISINE_OPTIONS.map((cuisine) => (
              <CuisinePill key={cuisine.slug} cuisine={cuisine} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Featured restaurants (horizontal scroll) */}
      {featured.length > 0 && (
        <section data-slot="featured-section" className="py-2">
          <RestaurantCardList
            title="Featured near you"
            restaurants={featured}
            direction="horizontal"
            seeAllHref="/search"
          />
        </section>
      )}

      {/* Nearby restaurants (vertical grid) */}
      <section data-slot="nearby-section" className="py-4">
        <RestaurantCardList
          title="Nearby restaurants"
          restaurants={nearby}
          direction="vertical"
          seeAllHref="/search"
        />
      </section>
    </div>
  );
}
