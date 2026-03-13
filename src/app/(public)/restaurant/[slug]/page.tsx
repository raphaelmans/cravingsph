import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { RestaurantHeader } from "@/features/menu/components/restaurant-header";
import { RestaurantMenu } from "@/features/menu/components/restaurant-menu";
import { NotFoundError } from "@/shared/kernel/errors";
import { api } from "@/trpc/server";

export const revalidate = 300;

const getRestaurant = cache(async (slug: string) => {
  const caller = await api();
  return caller.restaurant.getBySlug({ slug });
});

async function getRestaurantForPage(slug: string) {
  try {
    return await getRestaurant(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }
}

async function getRestaurantForMetadata(slug: string) {
  try {
    return await getRestaurant(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantForMetadata(slug);

  if (!restaurant) {
    return {
      title: "Restaurant not found | CravingsPH",
      description:
        "Browse verified restaurants and digital menus across CravingsPH.",
    };
  }

  const cuisineLabel = restaurant.cuisineType
    ? `${restaurant.cuisineType} favorites`
    : "digital menu favorites";
  const description =
    restaurant.description?.trim() ||
    `Browse ${cuisineLabel} from ${restaurant.name}, place a dine-in or pickup order, and track it on CravingsPH.`;

  return {
    title: `${restaurant.name} | CravingsPH`,
    description,
    openGraph: {
      title: `${restaurant.name} | CravingsPH`,
      description,
      type: "website",
      images: restaurant.coverUrl
        ? [{ url: restaurant.coverUrl, alt: restaurant.name }]
        : ["/logo.svg"],
    },
    twitter: {
      card: restaurant.coverUrl ? "summary_large_image" : "summary",
      title: `${restaurant.name} | CravingsPH`,
      description,
      images: restaurant.coverUrl ? [restaurant.coverUrl] : ["/logo.svg"],
    },
  };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantForPage(slug);
  const { branch, menu } = await getMenuForRestaurant(restaurant.id);

  return (
    <div data-slot="restaurant-page">
      <RestaurantHeader
        restaurant={restaurant}
        branchAddress={branch?.address}
      />

      <RestaurantMenu menu={menu} branchSlug={slug} branchId={branch?.id} />
    </div>
  );
}
