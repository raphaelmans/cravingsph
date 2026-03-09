import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CUISINE_OPTIONS,
  CuisinePill,
} from "@/features/discovery/components/cuisine-pill";
import { HeroSection } from "@/features/discovery/components/hero-section";
import { RestaurantCardList } from "@/features/discovery/components/restaurant-card-list";
import { ScanQRCTA } from "@/features/discovery/components/scan-qr-cta";
import { api } from "@/trpc/server";

export default async function HomePage() {
  const caller = await api();
  const [featured, nearby] = await Promise.all([
    caller.discovery.featured({ limit: 6 }),
    caller.discovery.nearby({ limit: 6 }),
  ]);

  return (
    <main className="flex min-h-dvh flex-col pb-24">
      {/* Hero */}
      <HeroSection />

      {/* Cuisine categories */}
      <section className="py-4">
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
      <div className="py-2">
        <RestaurantCardList
          title="Featured near you"
          restaurants={featured}
          direction="horizontal"
        />
      </div>

      {/* Nearby restaurants (vertical grid) */}
      <div className="py-4">
        <RestaurantCardList
          title="Nearby restaurants"
          restaurants={nearby}
          direction="vertical"
        />
      </div>

      {/* Scan QR CTA */}
      <ScanQRCTA />
    </main>
  );
}
