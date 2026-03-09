"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useAdminDashboardOverview() {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.admin.getDashboardOverview.queryOptions(),
    staleTime: 60 * 1000,
  });
}
