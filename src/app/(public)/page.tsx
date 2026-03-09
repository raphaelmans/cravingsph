import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  CUISINE_OPTIONS,
  CuisinePill,
} from "@/features/discovery/components/cuisine-pill";
import { HeroSection } from "@/features/discovery/components/hero-section";
import type { RestaurantPreview } from "@/features/discovery/components/restaurant-card";
import { RestaurantCardList } from "@/features/discovery/components/restaurant-card-list";
import { ScanQRCTA } from "@/features/discovery/components/scan-qr-cta";

// ---------------------------------------------------------------------------
// Stub data — will be replaced by tRPC calls (restaurant.listFeatured, etc.)
// ---------------------------------------------------------------------------

const FEATURED_RESTAURANTS: RestaurantPreview[] = [
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
];

const NEARBY_RESTAURANTS: RestaurantPreview[] = [
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

export default function HomePage() {
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
          restaurants={FEATURED_RESTAURANTS}
          direction="horizontal"
        />
      </div>

      {/* Nearby restaurants (vertical grid) */}
      <div className="py-4">
        <RestaurantCardList
          title="Nearby restaurants"
          restaurants={NEARBY_RESTAURANTS}
          direction="vertical"
        />
      </div>

      {/* Scan QR CTA */}
      <ScanQRCTA />
    </main>
  );
}
