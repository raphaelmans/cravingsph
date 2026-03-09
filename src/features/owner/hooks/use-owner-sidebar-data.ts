"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/**
 * Fetches the current user's organization for the sidebar header.
 */
export function useOrganization() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.organization.mine.queryOptions(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches restaurants for a given organization.
 * Used in the sidebar hierarchy.
 */
export function useRestaurants(organizationId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.restaurant.listByOrganization.queryOptions({
      organizationId: organizationId as string,
    }),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetches branches for a given restaurant.
 * Used in the sidebar hierarchy as a nested level.
 */
export function useBranches(restaurantId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.branch.listByRestaurant.queryOptions({
      restaurantId: restaurantId as string,
    }),
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000,
  });
}
