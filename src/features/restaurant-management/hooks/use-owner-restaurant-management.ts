"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";

interface UseOwnerRestaurantManagementOptions {
  restaurantId?: string;
  branchId?: string;
}

export function useOwnerRestaurantManagement(
  options: UseOwnerRestaurantManagementOptions = {},
) {
  const { restaurantId, branchId } = options;
  const trpc = useTRPC();

  const organizationQuery = useQuery({
    ...trpc.organization.mine.queryOptions(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const restaurantsQuery = useQuery({
    ...trpc.restaurant.listByOrganization.queryOptions({
      organizationId: organizationQuery.data?.id ?? "",
    }),
    enabled: Boolean(organizationQuery.data?.id),
    staleTime: 2 * 60 * 1000,
  });

  const branchesQuery = useQuery({
    ...trpc.branch.listByRestaurant.queryOptions({
      restaurantId: restaurantId ?? "",
    }),
    enabled: Boolean(restaurantId),
    staleTime: 2 * 60 * 1000,
  });

  const restaurant = useMemo(
    () =>
      restaurantsQuery.data?.find((item) => item.id === restaurantId) ?? null,
    [restaurantId, restaurantsQuery.data],
  );

  const branch = useMemo(
    () => branchesQuery.data?.find((item) => item.id === branchId) ?? null,
    [branchId, branchesQuery.data],
  );

  return {
    organization: organizationQuery.data ?? null,
    restaurants: restaurantsQuery.data ?? [],
    restaurant,
    branches: branchesQuery.data ?? [],
    branch,
    isLoading:
      organizationQuery.isLoading ||
      restaurantsQuery.isLoading ||
      (Boolean(restaurantId) && branchesQuery.isLoading),
    isRestaurantsLoading: restaurantsQuery.isLoading,
    isBranchesLoading: branchesQuery.isLoading,
  };
}
