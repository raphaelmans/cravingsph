"use client";

import { useMemo } from "react";
import {
  useBranches,
  useOrganization,
  useRestaurants,
} from "@/features/owner/hooks/use-owner-sidebar-data";

export type StepStatus = "complete" | "in-progress" | "not-started";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  href: string;
}

const TOTAL_STEPS = 7;

export function useOnboardingStatus() {
  const { data: organization, isLoading: orgLoading } = useOrganization();
  const { data: restaurants = [], isLoading: restaurantsLoading } =
    useRestaurants(organization?.id);
  const firstRestaurant = restaurants[0];
  const { data: branches = [], isLoading: branchesLoading } = useBranches(
    firstRestaurant?.id,
  );

  const isLoading = orgLoading || restaurantsLoading || branchesLoading;

  const steps: OnboardingStep[] = useMemo(() => {
    const hasOrg = !!organization;
    const hasRestaurant = restaurants.length > 0;
    const hasBranch = branches.length > 0;
    // Menu, payment, verification — not queryable yet, stub as not-started
    const hasMenu = false;
    const hasPayment = false;
    const hasVerification = false;

    const getStatus = (done: boolean, prevDone: boolean): StepStatus => {
      if (done) return "complete";
      if (prevDone) return "in-progress";
      return "not-started";
    };

    return [
      {
        id: 1,
        title: "Create Organization",
        description: "Set up your business name and details",
        status: hasOrg ? "complete" : "in-progress",
        href: "/organization/onboarding?step=1",
      },
      {
        id: 2,
        title: "Add Restaurant",
        description: "Add your first restaurant with cuisine and contact info",
        status: getStatus(hasRestaurant, hasOrg),
        href: "/organization/onboarding?step=2",
      },
      {
        id: 3,
        title: "Add Branch",
        description: "Set up a branch location with address and phone",
        status: getStatus(hasBranch, hasRestaurant),
        href: "/organization/onboarding?step=3",
      },
      {
        id: 4,
        title: "Build Menu",
        description: "Add categories and items to your menu",
        status: getStatus(hasMenu, hasBranch),
        href: "/organization/onboarding?step=4",
      },
      {
        id: 5,
        title: "Payment Methods",
        description: "Configure how customers can pay",
        status: getStatus(hasPayment, hasMenu),
        href: "/organization/onboarding?step=5",
      },
      {
        id: 6,
        title: "Verification",
        description: "Upload documents to verify your business",
        status: getStatus(hasVerification, hasPayment),
        href: "/organization/onboarding?step=6",
      },
      {
        id: 7,
        title: "Complete",
        description: "Review and launch your restaurant",
        status: getStatus(false, hasVerification),
        href: "/organization/onboarding?step=7",
      },
    ];
  }, [organization, restaurants, branches]);

  const completedCount = steps.filter((s) => s.status === "complete").length;

  return { steps, completedCount, totalSteps: TOTAL_STEPS, isLoading };
}
