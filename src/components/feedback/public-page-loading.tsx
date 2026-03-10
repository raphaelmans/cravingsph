import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";

const cuisinePillKeys = [
  "pill-1",
  "pill-2",
  "pill-3",
  "pill-4",
  "pill-5",
  "pill-6",
];

const horizontalCardKeys = ["h-card-1", "h-card-2", "h-card-3"];
const verticalCardKeys = ["v-card-1", "v-card-2", "v-card-3", "v-card-4"];

/** Matches RestaurantCard: h-32 cover + compact p-3 pt-2 content */
function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border-0 bg-card shadow-sm">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-1.5 p-3 pt-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PublicPageLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-svh bg-background"
    >
      {/* Hero — matches HeroSection: centered, solid bg-peach, px-6 pb-8 pt-12 */}
      <section className="flex flex-col items-center gap-3 bg-peach px-6 pb-8 pt-12">
        <Logo size="lg" />
        <div className="space-y-1 text-center">
          <Skeleton className="mx-auto h-6 w-52 rounded-full bg-background/80" />
          <Skeleton className="mx-auto h-4 w-64 rounded-full bg-background/70" />
        </div>
        <Skeleton className="mt-1 h-10 w-full max-w-sm rounded-full bg-background/90" />
      </section>

      {/* Cuisine pills — matches CuisinePill scroll: h-8 pills, gap-2, px-4 */}
      <section className="py-4">
        <div className="flex gap-2 overflow-hidden px-4 pb-3">
          {cuisinePillKeys.map((key) => (
            <Skeleton key={key} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </section>

      {/* Featured section — horizontal scroll like RestaurantCardList direction="horizontal" */}
      <section className="space-y-3 py-2">
        <div className="px-4">
          <Skeleton className="h-5 w-36 rounded" />
        </div>
        <div className="flex gap-3 overflow-hidden px-4">
          {horizontalCardKeys.map((key) => (
            <div key={key} className="w-[260px] shrink-0">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </section>

      {/* Nearby section — vertical grid like RestaurantCardList direction="vertical" sm:grid-cols-2 */}
      <section className="space-y-3 py-4">
        <div className="px-4">
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <div className="grid gap-3 px-4 sm:grid-cols-2">
          {verticalCardKeys.map((key) => (
            <CardSkeleton key={key} />
          ))}
        </div>
      </section>
    </div>
  );
}
