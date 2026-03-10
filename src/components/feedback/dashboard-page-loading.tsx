import { Skeleton } from "@/components/ui/skeleton";

const statSkeletonKeys = [
  "dashboard-stat-1",
  "dashboard-stat-2",
  "dashboard-stat-3",
  "dashboard-stat-4",
];

const activitySkeletonKeys = [
  "dashboard-activity-1",
  "dashboard-activity-2",
  "dashboard-activity-3",
  "dashboard-activity-4",
  "dashboard-activity-5",
];

export function DashboardPageLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-svh flex-col"
    >
      {/* Navbar — matches DashboardNavbar: min-h-14 border-b px-4 py-2 */}
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b px-4 py-2">
        <Skeleton className="size-7 rounded-md" />
        <Skeleton className="hidden h-4 w-px sm:block" />
        <Skeleton className="h-4 w-32 rounded-full" />
      </header>

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Page title — matches: text-2xl font-bold + text-muted-foreground */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-full" />
          <Skeleton className="h-4 w-80 max-w-full rounded-full" />
        </div>

        {/* Stat cards — matches: sm:grid-cols-2 xl:grid-cols-4 */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statSkeletonKeys.map((key) => (
            <div key={key} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between pb-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="size-4 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-16 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed — matches AdminRecentActivityFeed structure */}
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <Skeleton className="h-5 w-32 rounded" />
          </div>
          <div className="divide-y">
            {activitySkeletonKeys.map((key) => (
              <div key={key} className="flex items-center gap-2 px-4 py-2">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
