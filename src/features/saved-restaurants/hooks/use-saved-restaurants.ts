"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";

export function useSavedRestaurants() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const listQuery = useQuery(trpc.savedRestaurant.list.queryOptions());

  const toggleMutation = useMutation(
    trpc.savedRestaurant.toggle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.savedRestaurant.list.queryKey(),
        });
      },
    }),
  );

  const restaurants = useMemo(
    () =>
      [...(listQuery.data ?? [])].sort(
        (left, right) =>
          new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
      ),
    [listQuery.data],
  );

  const stats = useMemo(() => {
    const cuisineCount = new Set(restaurants.flatMap((r) => r.cuisineTypes))
      .size;
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlySavedCount = restaurants.filter(
      (r) => new Date(r.savedAt).getTime() >= recentCutoff,
    ).length;

    return {
      totalSaved: restaurants.length,
      cuisineCount,
      recentlySavedCount,
    };
  }, [restaurants]);

  const unsaveRestaurant = (restaurantId: string) => {
    toggleMutation.mutate({ restaurantId });
  };

  const toggleSavedRestaurant = (restaurantId: string, note?: string) => {
    toggleMutation.mutate({ restaurantId, note });
  };

  const isSaved = (restaurantId: string) =>
    restaurants.some((r) => r.restaurantId === restaurantId);

  return {
    restaurants,
    stats,
    unsaveRestaurant,
    toggleSavedRestaurant,
    isSaved,
    isLoading: listQuery.isLoading,
  };
}
