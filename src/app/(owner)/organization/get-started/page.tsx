"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerWalkthroughPanel } from "@/features/onboarding/components/owner-walkthrough-panel";
import { SetupCard } from "@/features/onboarding/components/setup-card";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding-status";

export default function GetStartedPage() {
  const { steps, completedCount, totalSteps, isLoading } =
    useOnboardingStatus();

  const progressPercent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-6 md:p-8">
      <AppPageHeader
        eyebrow="Owner onboarding"
        title="Set up your restaurant"
        description="Complete each step to go live."
        icon={<Rocket className="size-5" />}
      />

      <OwnerWalkthroughPanel
        flowId="owner-get-started"
        title="Work through setup in the right order"
        description="Open the next step or jump into the wizard."
        steps={[
          {
            title: "Use the progress bar as your launch status",
            description: "See how much of the activation path is done.",
          },
          {
            title: "Open the next incomplete card",
            description: "Each card links directly to the correct step.",
          },
          {
            title: "Switch to the full wizard when you want momentum",
            description: "One guided pass without bouncing between pages.",
          },
        ]}
      />

      {/* Progress overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${completedCount} of ${totalSteps} steps complete`
            )}
          </span>
          {!isLoading && (
            <span className="font-medium">{progressPercent}%</span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-2 w-full" />
        ) : (
          <Progress value={progressPercent} className="h-2" />
        )}
      </div>

      {/* Setup cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading
          ? ["org", "restaurant", "branch", "menu", "complete"].map((key) => (
              <Skeleton key={key} className="h-[88px] rounded-xl" />
            ))
          : steps.map((step) => <SetupCard key={step.id} step={step} />)}
      </div>

      {/* Wizard CTA */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <Button asChild size="lg">
          <Link href={appRoutes.organization.onboarding}>
            {completedCount === 0
              ? "Start Setup Wizard"
              : "Continue Setup Wizard"}
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Or click any card above to jump to a specific step
        </p>
      </div>
    </div>
  );
}
