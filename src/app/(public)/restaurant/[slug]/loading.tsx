import { Skeleton } from "@/components/ui/skeleton";

const categoryTabKeys = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5"];

const menuItemKeys = ["item-1", "item-2", "item-3", "item-4"];

export default function RestaurantLoading() {
  return (
    <div data-slot="restaurant-loading">
      {/* Cover image — matches CoverImage: aspect-video */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Profile section — matches RestaurantHeader: px-4 pb-4 */}
      <div className="px-4 pb-4">
        {/* Logo avatar — matches: -mt-8 mb-2 size-16 rounded-full border-4 */}
        <Skeleton className="-mt-8 mb-2 size-16 rounded-full border-4 border-background" />
        {/* Name — matches: font-heading text-xl font-bold */}
        <Skeleton className="h-6 w-48" />
        {/* Cuisine type */}
        <Skeleton className="mt-1 h-4 w-24" />
        {/* Address with icon */}
        <Skeleton className="mt-1 h-4 w-64" />
        {/* Phone button — matches CopyContactButton: Button ghost sm pill */}
        <Skeleton className="mt-2 h-8 w-32 rounded-full" />
      </div>

      {/* Category tabs — matches: sticky top-0 z-10 border-b bg-background/95 backdrop-blur */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Search icon button */}
          <Skeleton className="size-8 shrink-0 rounded-full" />
          {categoryTabKeys.map((key) => (
            <Skeleton
              key={key}
              className="h-8 w-20 shrink-0 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Menu item cards — matches MenuItemCard: flex gap-3 rounded-lg p-2, size-20 image */}
      <div className="space-y-1 px-4 pt-2">
        {menuItemKeys.map((key) => (
          <div key={key} className="flex gap-3 rounded-lg p-2">
            <Skeleton className="size-20 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col justify-between py-0.5">
              <div className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
