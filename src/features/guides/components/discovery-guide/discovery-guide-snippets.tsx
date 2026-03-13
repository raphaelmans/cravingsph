import { MapPin, QrCode, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GuideSnippetWrapper } from "@/features/guides/components/guide-snippet-wrapper";

// ---------------------------------------------------------------------------
// Mock: Restaurant search results
// ---------------------------------------------------------------------------

function MockRestaurantSearch() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search restaurants or dishes..."
            shape="pill"
            className="pl-10"
            defaultValue="adobo house"
            readOnly
          />
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium shadow-sm">
            Restaurants
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
            Food
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MockRestaurantCard
            name="Adobo House Manila"
            cuisine="Filipino"
            items={["Chicken Adobo", "Pork Sinigang"]}
          />
          <MockRestaurantCard
            name="Adobo House Cebu"
            cuisine="Filipino"
            items={["Lechon Kawali", "Kare-Kare"]}
          />
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

function MockRestaurantCard({
  name,
  cuisine,
  items,
}: {
  name: string;
  cuisine: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 h-24 rounded-xl bg-muted" />
      <p className="font-heading text-sm font-semibold">{name}</p>
      <p className="text-xs text-muted-foreground">{cuisine}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-[10px]">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: Food search results
// ---------------------------------------------------------------------------

function MockFoodSearch() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for dishes..."
            shape="pill"
            className="pl-10"
            defaultValue="sinigang"
            readOnly
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3 dishes across 2 restaurants for "sinigang"
        </p>
        <div className="space-y-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="font-heading text-sm font-semibold">
              Kusina ni Maria
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <MockDishChip name="Sinigang na Baboy" price="₱220" />
              <MockDishChip name="Sinigang na Hipon" price="₱280" />
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <p className="font-heading text-sm font-semibold">Lola's Kitchen</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <MockDishChip name="Sinigang na Bangus" price="₱195" />
            </div>
          </div>
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

function MockDishChip({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
      <div className="size-6 rounded-full bg-muted" />
      <span className="text-xs font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{price}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock: Filter bar
// ---------------------------------------------------------------------------

function MockFilterBar() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border bg-muted p-0.5">
            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium shadow-sm">
              Restaurants
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
              Food
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
            <MapPin className="size-3.5" />
            <span className="text-xs">Makati</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border px-3 py-1.5">
            <MapPin className="size-3.5" />
            <span className="text-xs">Brgy. Poblacion</span>
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden">
          {["All", "Filipino", "Japanese", "Korean", "Chinese"].map(
            (cuisine) => (
              <span
                key={cuisine}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                  cuisine === "Filipino"
                    ? "bg-primary text-primary-foreground"
                    : "border text-muted-foreground"
                }`}
              >
                {cuisine}
              </span>
            ),
          )}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: Menu view
// ---------------------------------------------------------------------------

function MockMenuView() {
  return (
    <GuideSnippetWrapper>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted" />
          <div>
            <p className="font-heading text-sm font-semibold">
              Kusina ni Maria
            </p>
            <p className="text-xs text-muted-foreground">
              Filipino • Poblacion, Makati
            </p>
          </div>
        </div>
        <div className="flex gap-2 border-b pb-2">
          {["Appetisers", "Main Course", "Drinks", "Desserts"].map((cat, i) => (
            <span
              key={cat}
              className={`text-xs font-medium ${
                i === 1
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { name: "Chicken Adobo", price: "₱180" },
            { name: "Sinigang na Baboy", price: "₱220" },
            { name: "Kare-Kare", price: "₱260" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border bg-card p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.price}</p>
              </div>
              <div className="size-12 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Mock: QR scanner
// ---------------------------------------------------------------------------

function MockQRScanner() {
  return (
    <GuideSnippetWrapper>
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <QrCode className="size-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Scan QR code</p>
        <p className="text-center text-xs text-muted-foreground">
          Point your camera at the QR code on the table to open the restaurant
          menu with your table number pre-filled.
        </p>
        <div className="size-32 rounded-2xl border-2 border-dashed border-muted-foreground/30" />
      </div>
    </GuideSnippetWrapper>
  );
}

// ---------------------------------------------------------------------------
// Snippet map
// ---------------------------------------------------------------------------

const DISCOVERY_GUIDE_SNIPPET_MAP: Record<string, React.ComponentType> = {
  "search-restaurants": MockRestaurantSearch,
  "search-dishes": MockFoodSearch,
  "apply-filters": MockFilterBar,
  "browse-menu": MockMenuView,
  "scan-qr-code": MockQRScanner,
};

export function getDiscoverySnippetForSection(
  sectionId: string,
): React.ComponentType | null {
  return DISCOVERY_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
