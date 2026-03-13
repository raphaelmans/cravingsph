"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SetupCard } from "@/features/onboarding/components/setup-card";
import { useOnboardingStatus } from "@/features/onboarding/hooks/use-onboarding-status";

export default function GetStartedPage() {
  const { steps, completedCount, totalSteps, isLoading } =
    useOnboardingStatus();

  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="size-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Set Up Your Restaurant
          </h1>
        </div>
        <p className="text-muted-foreground">
          Complete the steps below to start accepting orders on cravıngs.
        </p>
      </div>

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
