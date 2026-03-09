import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";

const pillSkeletonKeys = [
  "public-pill-1",
  "public-pill-2",
  "public-pill-3",
  "public-pill-4",
];

const cardSkeletonKeys = ["public-card-1", "public-card-2", "public-card-3"];

export function PublicPageLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-svh bg-background pb-20"
    >
      <section className="bg-gradient-to-b from-peach via-peach/60 to-background px-4 pb-8 pt-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Logo size="lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-60 rounded-full bg-white/80" />
            <Skeleton className="h-4 w-72 rounded-full bg-white/70" />
          </div>
          <Skeleton className="h-12 w-full max-w-md rounded-full bg-white/90" />
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <div className="flex gap-2 overflow-hidden">
          {pillSkeletonKeys.map((key) => (
            <Skeleton key={key} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardSkeletonKeys.map((key) => (
            <div
              key={key}
              className="overflow-hidden rounded-3xl border bg-card shadow-sm"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-6 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
