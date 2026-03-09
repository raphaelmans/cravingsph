"use client";

import {
  Building2,
  Check,
  ChefHat,
  CreditCard,
  MapPin,
  PartyPopper,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type {
  OnboardingStep,
  StepStatus,
} from "../hooks/use-onboarding-status";

const stepIcons: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Building2,
  2: Store,
  3: MapPin,
  4: ChefHat,
  5: CreditCard,
  6: ShieldCheck,
  7: PartyPopper,
};

const statusConfig: Record<
  StepStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  complete: { label: "Complete", variant: "default" },
  "in-progress": { label: "In Progress", variant: "secondary" },
  "not-started": { label: "Not Started", variant: "outline" },
};

export function SetupCard({ step }: { step: OnboardingStep }) {
  const Icon = stepIcons[step.id] ?? Building2;
  const config = statusConfig[step.status];

  return (
    <Link href={step.href}>
      <Card className="flex items-start gap-4 p-4 transition-colors hover:bg-accent/50">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {step.status === "complete" ? (
            <Check className="size-5 text-primary" />
          ) : (
            <Icon className="size-5 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">{step.title}</CardTitle>
            <Badge variant={config.variant} className="text-xs shrink-0">
              {config.label}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {step.description}
          </CardDescription>
        </div>
      </Card>
    </Link>
  );
}
