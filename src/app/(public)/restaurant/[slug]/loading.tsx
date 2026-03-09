import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantLoading() {
  return (
    <div data-slot="restaurant-loading">
      {/* Cover image skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Profile section */}
      <div className="px-4 pb-4">
        {/* Logo avatar */}
        <Skeleton className="-mt-8 mb-2 size-16 rounded-full border-4 border-background" />

        {/* Name */}
        <Skeleton className="h-6 w-48" />
        {/* Cuisine type */}
        <Skeleton className="mt-1 h-4 w-24" />
        {/* Address */}
        <Skeleton className="mt-2 h-4 w-64" />
        {/* Phone */}
        <Skeleton className="mt-2 h-8 w-32 rounded-full" />
      </div>

      {/* Category tabs skeleton */}
      <div className="flex gap-2 overflow-hidden px-4 py-3">
        <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-24 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-16 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-22 shrink-0 rounded-full" />
      </div>

      {/* Menu item cards skeleton */}
      <div className="space-y-4 px-4 pt-2">
        <div className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
