"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

/**
 * Fetches the full menu for management (includes unavailable items).
 */
export function useManagementMenu(branchId: string) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.menu.getManagementMenu.queryOptions({ branchId }),
    staleTime: 60 * 1000,
  });
}

/**
 * Toggles item availability via optimistic update.
 */
export function useToggleAvailability(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.updateItem.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Deletes a menu item with cache invalidation.
 */
export function useDeleteItem(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.deleteItem.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Creates a new category with cache invalidation.
 */
export function useCreateCategory(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.createCategory.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Creates a new menu item with cache invalidation.
 */
export function useCreateItem(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.createItem.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Updates a menu item with cache invalidation.
 */
export function useUpdateItem(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.updateItem.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Deletes a category with cache invalidation.
 */
export function useDeleteCategory(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.menu.getManagementMenu.queryKey({ branchId });

  return useMutation({
    ...trpc.menu.deleteCategory.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
