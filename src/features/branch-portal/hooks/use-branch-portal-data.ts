"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

/**
 * Fetches all branches the current user can access.
 * Used in the branch portal sidebar for the branch switcher.
 */
export function useAccessibleBranches() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.branch.listAccessible.queryOptions(),
    staleTime: 2 * 60 * 1000,
  });
}
