"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

export function useTables(branchId: string) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.table.list.queryOptions({ branchId }),
    staleTime: 30 * 1000,
  });
}

export function useCreateTable(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateTable(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteTable(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useOpenSession(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.openSession.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useCloseSession(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.closeSession.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useCloseAllSessions(branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  const queryKey = trpc.table.list.queryKey({ branchId });

  return useMutation({
    ...trpc.table.closeAllSessions.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
