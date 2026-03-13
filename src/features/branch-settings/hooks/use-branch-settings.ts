"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  slotIndex: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

const MAX_SLOTS_PER_DAY = 4;

const DAY_LABELS: Record<number, { dayKey: WeekDayKey; label: string }> = {
  0: { dayKey: "monday", label: "Monday" },
  1: { dayKey: "tuesday", label: "Tuesday" },
  2: { dayKey: "wednesday", label: "Wednesday" },
  3: { dayKey: "thursday", label: "Thursday" },
  4: { dayKey: "friday", label: "Friday" },
  5: { dayKey: "saturday", label: "Saturday" },
  6: { dayKey: "sunday", label: "Sunday" },
};

const DEFAULT_WEEKLY_HOURS: BranchOperatingHour[] = [
  {
    dayKey: "monday",
    label: "Monday",
    slotIndex: 0,
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "tuesday",
    label: "Tuesday",
    slotIndex: 0,
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "wednesday",
    label: "Wednesday",
    slotIndex: 0,
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "thursday",
    label: "Thursday",
    slotIndex: 0,
    opensAt: "09:00",
    closesAt: "21:00",
    isClosed: false,
  },
  {
    dayKey: "friday",
    label: "Friday",
    slotIndex: 0,
    opensAt: "09:00",
    closesAt: "22:00",
    isClosed: false,
  },
  {
    dayKey: "saturday",
    label: "Saturday",
    slotIndex: 0,
    opensAt: "10:00",
    closesAt: "22:00",
    isClosed: false,
  },
  {
    dayKey: "sunday",
    label: "Sunday",
    slotIndex: 0,
    opensAt: "10:00",
    closesAt: "20:00",
    isClosed: true,
  },
];

function serverToClient(
  serverHours: {
    dayOfWeek: number;
    slotIndex: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }[],
): BranchOperatingHour[] {
  if (serverHours.length === 0)
    return DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));

  return serverHours
    .map((h) => {
      const meta = DAY_LABELS[h.dayOfWeek];
      return {
        dayKey: meta.dayKey,
        label: meta.label,
        slotIndex: h.slotIndex,
        opensAt: h.opensAt.slice(0, 5),
        closesAt: h.closesAt.slice(0, 5),
        isClosed: h.isClosed,
      };
    })
    .sort((a, b) => {
      const dayA = WEEK_DAY_KEYS.indexOf(a.dayKey);
      const dayB = WEEK_DAY_KEYS.indexOf(b.dayKey);
      if (dayA !== dayB) return dayA - dayB;
      return a.slotIndex - b.slotIndex;
    });
}

function clientToServer(hours: BranchOperatingHour[]): {
  dayOfWeek: number;
  slotIndex: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}[] {
  return hours.map((h) => ({
    dayOfWeek: WEEK_DAY_KEYS.indexOf(h.dayKey),
    slotIndex: h.slotIndex,
    opensAt: h.opensAt,
    closesAt: h.closesAt,
    isClosed: h.isClosed,
  }));
}

export interface BranchOrderSettingsInput {
  isOrderingEnabled: boolean;
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

  const operatingHoursQuery = useQuery({
    ...trpc.branch.getOperatingHours.queryOptions({ branchId }),
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

  const [hoursDraft, setHoursDraft] = useState<BranchOperatingHour[] | null>(
    null,
  );

  useEffect(() => {
    if (operatingHoursQuery.data) {
      setHoursDraft(serverToClient(operatingHoursQuery.data));
    }
  }, [operatingHoursQuery.data]);

  const weeklyHours = hoursDraft ?? DEFAULT_WEEKLY_HOURS;

  const updateBranchMutation = useMutation({
    ...trpc.branch.update.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.branch.listByRestaurant.queryKey({ restaurantId }),
      });
    },
  });

  const updateHoursMutation = useMutation({
    ...trpc.branch.updateOperatingHours.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.branch.getOperatingHours.queryKey({ branchId }),
      });
    },
  });

  function updateWeeklyHour(
    dayKey: WeekDayKey,
    slotIndex: number,
    updates: Partial<BranchOperatingHour>,
  ) {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));
      return current.map((hour) =>
        hour.dayKey === dayKey && hour.slotIndex === slotIndex
          ? { ...hour, ...updates }
          : hour,
      );
    });
  }

  function addTimeSlot(dayKey: WeekDayKey) {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));
      const daySlotsCount = current.filter((h) => h.dayKey === dayKey).length;

      if (daySlotsCount >= MAX_SLOTS_PER_DAY) return current;

      const maxSlotIndex = current
        .filter((h) => h.dayKey === dayKey)
        .reduce((max, h) => Math.max(max, h.slotIndex), -1);

      const meta = DAY_LABELS[WEEK_DAY_KEYS.indexOf(dayKey)];
      const newSlot: BranchOperatingHour = {
        dayKey,
        label: meta.label,
        slotIndex: maxSlotIndex + 1,
        opensAt: "12:00",
        closesAt: "18:00",
        isClosed: false,
      };

      // Insert the new slot right after the last slot for this day
      const lastDaySlotIdx = current.findLastIndex((h) => h.dayKey === dayKey);
      const result = [...current];
      result.splice(lastDaySlotIdx + 1, 0, newSlot);
      return result;
    });
  }

  function removeTimeSlot(dayKey: WeekDayKey, slotIndex: number) {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));
      const daySlotsCount = current.filter((h) => h.dayKey === dayKey).length;

      // Must keep at least 1 slot per day
      if (daySlotsCount <= 1) return current;

      return current.filter(
        (h) => !(h.dayKey === dayKey && h.slotIndex === slotIndex),
      );
    });
  }

  function applyWeekdayTemplate() {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));

      // Get all Monday slots as the template
      const mondaySlots = current.filter((h) => h.dayKey === "monday");

      const weekdays: WeekDayKey[] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ];

      // Remove all weekday slots, then add template-based slots for each weekday
      const weekendSlots = current.filter((h) => !weekdays.includes(h.dayKey));

      const newWeekdaySlots = weekdays.flatMap((dayKey) => {
        const meta = DAY_LABELS[WEEK_DAY_KEYS.indexOf(dayKey)];
        return mondaySlots.map((template) => ({
          ...template,
          dayKey,
          label: meta.label,
        }));
      });

      return [...newWeekdaySlots, ...weekendSlots].sort((a, b) => {
        const dayA = WEEK_DAY_KEYS.indexOf(a.dayKey);
        const dayB = WEEK_DAY_KEYS.indexOf(b.dayKey);
        if (dayA !== dayB) return dayA - dayB;
        return a.slotIndex - b.slotIndex;
      });
    });
  }

  function resetWeeklyHours() {
    setHoursDraft(DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d })));
  }

  async function saveWeeklyHours() {
    await updateHoursMutation.mutateAsync({
      branchId,
      hours: clientToServer(weeklyHours),
    });
  }

  async function saveOrderSettings(input: BranchOrderSettingsInput) {
    await updateBranchMutation.mutateAsync({
      id: branchId,
      isOrderingEnabled: input.isOrderingEnabled,
    });
  }

  return {
    organization: organizationQuery.data ?? null,
    restaurant,
    branch,
    weeklyHours,
    updateWeeklyHour,
    addTimeSlot,
    removeTimeSlot,
    applyWeekdayTemplate,
    resetWeeklyHours,
    saveWeeklyHours,
    saveOrderSettings,
    isLoading:
      organizationQuery.isLoading ||
      restaurantsQuery.isLoading ||
      branchesQuery.isLoading ||
      operatingHoursQuery.isLoading,
    isSavingOrderSettings: updateBranchMutation.isPending,
    isSavingWeeklyHours: updateHoursMutation.isPending,
  };
}
