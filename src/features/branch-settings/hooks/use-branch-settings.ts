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
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

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

function serverToClient(
  serverHours: {
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
    isClosed: boolean;
  }[],
): BranchOperatingHour[] {
  if (serverHours.length === 0)
    return DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));

  return serverHours.map((h) => {
    const meta = DAY_LABELS[h.dayOfWeek];
    return {
      dayKey: meta.dayKey,
      label: meta.label,
      opensAt: h.opensAt.slice(0, 5),
      closesAt: h.closesAt.slice(0, 5),
      isClosed: h.isClosed,
    };
  });
}

function clientToServer(hours: BranchOperatingHour[]): {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}[] {
  return hours.map((h) => ({
    dayOfWeek: WEEK_DAY_KEYS.indexOf(h.dayKey),
    opensAt: h.opensAt,
    closesAt: h.closesAt,
    isClosed: h.isClosed,
  }));
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
    updates: Partial<BranchOperatingHour>,
  ) {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));
      return current.map((hour) =>
        hour.dayKey === dayKey ? { ...hour, ...updates } : hour,
      );
    });
  }

  function applyWeekdayTemplate() {
    setHoursDraft((prev) => {
      const current = prev ?? DEFAULT_WEEKLY_HOURS.map((d) => ({ ...d }));
      const template =
        current.find((h) => h.dayKey === "monday") ?? DEFAULT_WEEKLY_HOURS[0];
      return current.map((hour) =>
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
