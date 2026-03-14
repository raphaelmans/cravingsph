"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

/**
 * Fetches enriched team members for the current organization.
 */
export function useTeamMembers(organizationId: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.teamAccess.listMembers.queryOptions({
      organizationId: organizationId as string,
    }),
    enabled: !!organizationId,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetches enriched team invites for the current organization.
 */
export function useTeamInvites(
  organizationId: string | undefined,
  status?: "pending" | "accepted" | "expired" | "revoked",
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.teamAccess.invite.list.queryOptions({
      organizationId: organizationId as string,
      status,
    }),
    enabled: !!organizationId,
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation to create a team invite.
 */
export function useCreateInvite() {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  return useMutation({
    ...trpc.teamAccess.invite.create.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["teamAccess", "invite", "list"]],
      });
    },
  });
}

/**
 * Mutation to revoke a pending invite.
 */
export function useRevokeInvite() {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  return useMutation({
    ...trpc.teamAccess.invite.revoke.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["teamAccess", "invite", "list"]],
      });
    },
  });
}

/**
 * Mutation to revoke a team membership.
 */
export function useRevokeMember() {
  const trpc = useTRPC();
  const queryClient = getQueryClient();
  return useMutation({
    ...trpc.teamAccess.revokeMember.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["teamAccess", "listMembers"]],
      });
    },
  });
}
