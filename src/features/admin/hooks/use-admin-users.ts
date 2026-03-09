"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AdminUserListItemRecord } from "@/modules/admin/repositories/admin.repository";
import { useTRPC } from "@/trpc/client";

export type AdminUserRoleFilter = "all" | "admin" | "member" | "viewer";
export type AdminUserAccessFilter = "all" | "active" | "inactive" | "recent";

export interface AdminUserListItem extends AdminUserListItemRecord {
  isActive: boolean;
}

const RECENT_ACTIVITY_WINDOW_IN_DAYS = 30;

export function useAdminUsers() {
  const trpc = useTRPC();
  const query = useQuery({
    ...trpc.admin.getUsers.queryOptions(),
    staleTime: 30 * 1000,
  });

  const data = useMemo<AdminUserListItem[]>(() => {
    return (query.data ?? []).map((user) => ({
      ...user,
      isActive: !user.isSuspended,
    }));
  }, [query.data]);

  return {
    ...query,
    data,
  };
}

export function useSetUserActive() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation({
    ...trpc.admin.setUserActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.admin.getUsers.queryKey(),
      });
    },
  });
}

function matchesSearch(user: AdminUserListItem, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const haystack = [user.displayName, user.email, user.phone, user.role]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedSearchTerm);
}

export function isRecentlyActive(lastSignInAt: Date | string | null) {
  if (!lastSignInAt) {
    return false;
  }

  const lastSignInDate = new Date(lastSignInAt);
  const now = Date.now();
  const threshold = RECENT_ACTIVITY_WINDOW_IN_DAYS * 24 * 60 * 60 * 1000;

  return now - lastSignInDate.getTime() <= threshold;
}

export function filterAdminUsers(
  users: AdminUserListItem[],
  searchTerm: string,
  roleFilter: AdminUserRoleFilter,
  accessFilter: AdminUserAccessFilter,
) {
  return users.filter((user) => {
    if (!matchesSearch(user, searchTerm)) {
      return false;
    }

    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }

    switch (accessFilter) {
      case "active":
        return user.isActive;
      case "inactive":
        return !user.isActive;
      case "recent":
        return isRecentlyActive(user.lastSignInAt);
      default:
        return true;
    }
  });
}
