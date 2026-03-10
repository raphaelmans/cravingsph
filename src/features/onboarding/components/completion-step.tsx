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

interface CompletionStepProps {
  allComplete: boolean;
  completedCount: number;
  totalSteps: number;
}

export function CompletionStep({
  allComplete,
  completedCount,
  totalSteps,
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
        <CardContent className="flex flex-col items-center gap-3">
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

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="size-7 text-warning" />
          </div>
        </div>
        <CardTitle className="text-xl">Partial Setup Complete</CardTitle>
        <CardDescription>
          You&apos;ve completed {completedCount} of {totalSteps - 1} required
          steps. Finish the remaining steps to start accepting orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button asChild size="lg">
          <Link href={appRoutes.organization.base}>
            Go to Dashboard
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={appRoutes.organization.getStarted}>
            View Setup Progress
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
