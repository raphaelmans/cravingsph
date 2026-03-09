import { notFound } from "next/navigation";
import { RestaurantHeader } from "@/features/menu/components/restaurant-header";
import { RestaurantMenu } from "@/features/menu/components/restaurant-menu";
import { RestaurantReviews } from "@/features/orders/components/restaurant-reviews";
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

async function getMenuForRestaurant(restaurantId: string) {
  const caller = await api();
  const branches = await caller.branch.listPublicByRestaurant({
    restaurantId,
  });

  const primaryBranch = branches[0];
  if (!primaryBranch) {
    return { branch: null, menu: [] };
  }

  const menu = await caller.menu.getPublicMenu({
    branchId: primaryBranch.id,
  });

  return { branch: primaryBranch, menu };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  const { branch, menu } = await getMenuForRestaurant(restaurant.id);

  return (
    <div data-slot="restaurant-page">
      <RestaurantHeader
        restaurant={restaurant}
        branchAddress={branch?.address}
      />

      <RestaurantMenu menu={menu} branchSlug={slug} />
      <RestaurantReviews
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
