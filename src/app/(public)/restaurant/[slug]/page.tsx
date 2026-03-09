import { notFound } from "next/navigation";
import { RestaurantHeader } from "@/features/menu/components/restaurant-header";
import { NotFoundError } from "@/shared/kernel/errors";
import { api } from "@/trpc/server";

async function getRestaurant(slug: string) {
  const caller = await api();
  try {
    return await caller.restaurant.getBySlug({ slug });
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  return (
    <div data-slot="restaurant-page">
      <RestaurantHeader restaurant={restaurant} />

      {/* Menu content — populated in Steps 2b-2d */}
    </div>
  );
}
