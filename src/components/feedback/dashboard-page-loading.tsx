import { Skeleton } from "@/components/ui/skeleton";

const statSkeletonKeys = [
  "dashboard-stat-1",
  "dashboard-stat-2",
  "dashboard-stat-3",
  "dashboard-stat-4",
];

const listSkeletonKeys = [
  "dashboard-list-1",
  "dashboard-list-2",
  "dashboard-list-3",
  "dashboard-list-4",
];

export function DashboardPageLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-svh flex-col bg-muted/20"
    >
      <div className="border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full sm:ml-auto" />
        </div>
      </div>

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-full" />
          <Skeleton className="h-4 w-[28rem] max-w-full rounded-full" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statSkeletonKeys.map((key) => (
            <Skeleton key={key} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[28rem] rounded-xl" />
          <div className="space-y-4">
            {listSkeletonKeys.map((key) => (
              <Skeleton key={key} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
