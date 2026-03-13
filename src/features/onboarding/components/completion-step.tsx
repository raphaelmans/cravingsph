"use client";

import { AlertTriangle, ArrowRight, PartyPopper } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/common/app-routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OnboardingStep } from "../hooks/use-onboarding-status";

interface CompletionStepProps {
  allComplete: boolean;
  completedCount: number;
  totalSteps: number;
  steps: OnboardingStep[];
}

export function CompletionStep({
  allComplete,
  completedCount,
  totalSteps,
  steps,
}: CompletionStepProps) {
  if (allComplete) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10">
              <PartyPopper className="size-7 text-success" />
            </div>
          </div>
          <CardTitle className="text-xl">You&apos;re All Set!</CardTitle>
          <CardDescription>
            Your restaurant is ready to start accepting orders on cravıngs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button asChild size="lg">
            <Link href={appRoutes.organization.base}>
              Go to Dashboard
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const incompleteSteps = steps
    .filter((s) => s.id !== 5 && s.status !== "complete")
    .map((s) => s.title);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="size-7 text-warning" />
          </div>
        </div>
        <CardTitle className="text-xl">Almost There</CardTitle>
        <CardDescription>
          You&apos;ve completed {completedCount} of {totalSteps - 1} required
          steps. Finish these to start accepting orders:
        </CardDescription>
        {incompleteSteps.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {incompleteSteps.map((title) => (
              <li
                key={title}
                className="flex items-center justify-center gap-2"
              >
                <span className="size-1.5 rounded-full bg-warning" />
                {title}
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button asChild size="lg">
          <Link href={appRoutes.organization.getStarted}>
            View Setup Progress
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={appRoutes.organization.base}>Skip to Dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
