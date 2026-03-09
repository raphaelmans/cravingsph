"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminRestaurantListItemRecord } from "@/modules/admin/repositories/admin.repository";
import { useTRPC } from "@/trpc/client";

export type AdminRestaurantFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "featured"
  | "active"
  | "inactive";

export function useAdminRestaurants() {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.admin.getRestaurants.queryOptions(),
    staleTime: 30 * 1000,
  });
}

export function useAdminRestaurant(id: string) {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.admin.getRestaurant.queryOptions({ id }),
    enabled: id.length > 0,
    staleTime: 30 * 1000,
  });
}

export function useAdminRestaurantUpdate() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.admin.updateRestaurant.mutationOptions(),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getDashboardOverview.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getRestaurants.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getRestaurant.queryKey({
            id: variables.id,
          }),
        }),
      ]);
    },
  });
}

export function filterAdminRestaurants(
  restaurants: AdminRestaurantListItemRecord[],
  filter: AdminRestaurantFilter,
) {
  switch (filter) {
    case "pending":
    case "approved":
    case "rejected":
      return restaurants.filter(
        (restaurant) => restaurant.verificationStatus === filter,
      );
    case "featured":
      return restaurants.filter((restaurant) => restaurant.isFeatured);
    case "active":
      return restaurants.filter((restaurant) => restaurant.isActive);
    case "inactive":
      return restaurants.filter((restaurant) => !restaurant.isActive);
    default:
      return restaurants;
  }
}
