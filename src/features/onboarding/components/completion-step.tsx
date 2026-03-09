"use client";

import { ArrowRight, PartyPopper } from "lucide-react";
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

export function CompletionStep() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
            <PartyPopper className="size-7 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl">You&apos;re All Set!</CardTitle>
        <CardDescription>
          Your restaurant is ready to start accepting orders on cravıngs. You
          can always come back to complete any skipped steps from your
          dashboard.
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
