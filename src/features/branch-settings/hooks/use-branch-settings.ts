"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";
import { useTRPC } from "@/trpc/client";
import { getQueryClient } from "@/trpc/query-client";

export const WEEK_DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekDayKey = (typeof WEEK_DAY_KEYS)[number];

export interface BranchOperatingHour {
  dayKey: WeekDayKey;
  label: string;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

interface WeeklyHoursStore {
  byBranchId: Record<string, BranchOperatingHour[]>;
}

const DEFAULT_WEEKLY_HOURS: BranchOperatingHour[] = [
  {
    dayKey: "monday",
    label: "Monday",
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "tuesday",
    label: "Tuesday",
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "wednesday",
    label: "Wednesday",
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "thursday",
    label: "Thursday",
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "friday",
    label: "Friday",
    opensAt: "09:00",
    closesAt: "22:00",
    isClosed: false,
  },
  {
    dayKey: "saturday",
    label: "Saturday",
    opensAt: "10:00",
    closesAt: "22:00",
    isClosed: false,
  },
  {
    dayKey: "sunday",
    label: "Sunday",
    opensAt: "10:00",
    closesAt: "20:00",
    isClosed: true,
  },
];

let weeklyHoursStore: WeeklyHoursStore = {
  byBranchId: {},
};

const weeklyHoursListeners = new Set<() => void>();

function cloneDefaultWeeklyHours() {
  return DEFAULT_WEEKLY_HOURS.map((day) => ({ ...day }));
}

function subscribe(listener: () => void) {
  weeklyHoursListeners.add(listener);
  return () => weeklyHoursListeners.delete(listener);
}

function emitChange() {
  for (const listener of weeklyHoursListeners) {
    listener();
  }
}

function getBranchHoursSnapshot(branchId: string) {
  return weeklyHoursStore.byBranchId[branchId] ?? DEFAULT_WEEKLY_HOURS;
}

function setWeeklyHoursStore(next: WeeklyHoursStore) {
  weeklyHoursStore = next;
  emitChange();
}

function ensureBranchHours(branchId: string) {
  if (weeklyHoursStore.byBranchId[branchId]) {
    return weeklyHoursStore.byBranchId[branchId];
  }

  const next = cloneDefaultWeeklyHours();
  weeklyHoursStore = {
    byBranchId: {
      ...weeklyHoursStore.byBranchId,
      [branchId]: next,
    },
  };

  return next;
}

export interface BranchOrderSettingsInput {
  isOrderingEnabled: boolean;
  autoAcceptOrders: boolean;
  paymentCountdownMinutes: number;
}

export function useBranchSettings(restaurantId: string, branchId: string) {
  const trpc = useTRPC();
  const queryClient = getQueryClient();

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
      restaurantId,
    }),
    staleTime: 2 * 60 * 1000,
  });

  const branch = useMemo(
    () => branchesQuery.data?.find((item) => item.id === branchId) ?? null,
    [branchId, branchesQuery.data],
  );

  const restaurant = useMemo(
    () =>
      restaurantsQuery.data?.find((item) => item.id === restaurantId) ?? null,
    [restaurantId, restaurantsQuery.data],
  );

  const weeklyHours = useSyncExternalStore(
    subscribe,
    () => getBranchHoursSnapshot(branchId),
    () => getBranchHoursSnapshot(branchId),
  );

  const updateBranchMutation = useMutation({
    ...trpc.branch.update.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.branch.listByRestaurant.queryKey({ restaurantId }),
      });
    },
  });

  function updateWeeklyHour(
    dayKey: WeekDayKey,
    updates: Partial<BranchOperatingHour>,
  ) {
    const hours = ensureBranchHours(branchId);
    const next = hours.map((hour) =>
      hour.dayKey === dayKey ? { ...hour, ...updates } : hour,
    );

    setWeeklyHoursStore({
      byBranchId: {
        ...weeklyHoursStore.byBranchId,
        [branchId]: next,
      },
    });
  }

  function applyWeekdayTemplate() {
    const hours = ensureBranchHours(branchId);
    const template =
      hours.find((hour) => hour.dayKey === "monday") ?? DEFAULT_WEEKLY_HOURS[0];

    const next = hours.map((hour) =>
      ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
        hour.dayKey,
      )
        ? {
            ...hour,
            opensAt: template.opensAt,
            closesAt: template.closesAt,
            isClosed: template.isClosed,
          }
        : hour,
    );

    setWeeklyHoursStore({
      byBranchId: {
        ...weeklyHoursStore.byBranchId,
        [branchId]: next,
      },
    });
  }

  function resetWeeklyHours() {
    setWeeklyHoursStore({
      byBranchId: {
        ...weeklyHoursStore.byBranchId,
        [branchId]: cloneDefaultWeeklyHours(),
      },
    });
  }

  async function saveOrderSettings(input: BranchOrderSettingsInput) {
    await updateBranchMutation.mutateAsync({
      id: branchId,
      isOrderingEnabled: input.isOrderingEnabled,
      autoAcceptOrders: input.autoAcceptOrders,
      paymentCountdownMinutes: input.paymentCountdownMinutes,
    });
  }

  return {
    organization: organizationQuery.data ?? null,
    restaurant,
    branch,
    weeklyHours,
    updateWeeklyHour,
    applyWeekdayTemplate,
    resetWeeklyHours,
    saveOrderSettings,
    isLoading:
      organizationQuery.isLoading ||
      restaurantsQuery.isLoading ||
      branchesQuery.isLoading,
    isSavingOrderSettings: updateBranchMutation.isPending,
  };
}
