"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface OwnerWalkthroughStep {
  title: string;
  description: string;
}

interface WalkthroughProgress {
  version: string;
  completedStepIds: number[];
  dismissedAt?: string;
  completedAt?: string;
}

interface OwnerWalkthroughPanelProps {
  flowId: string;
  title: string;
  description: string;
  steps: OwnerWalkthroughStep[];
}

const STORAGE_PREFIX = "cravings:owner-walkthrough";

function readProgress(key: string): WalkthroughProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WalkthroughProgress;
  } catch {
    return null;
  }
}

export function OwnerWalkthroughPanel({
  flowId,
  title,
  description,
  steps,
}: OwnerWalkthroughPanelProps) {
  const storageKey = `${STORAGE_PREFIX}:${flowId}:v1`;
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [hasSavedState, setHasSavedState] = useState(false);

  useEffect(() => {
    const progress = readProgress(storageKey);
    if (!progress) {
      return;
    }

    setHasSavedState(Boolean(progress.dismissedAt || progress.completedAt));

    if (progress.completedAt || progress.dismissedAt) {
      setIsOpen(false);
      setCurrentStep(Math.max(steps.length - 1, 0));
      return;
    }

    if (progress.completedStepIds.length > 0) {
      setCurrentStep(
        Math.min(
          progress.completedStepIds.length,
          Math.max(steps.length - 1, 0),
        ),
      );
    }
  }, [storageKey, steps.length]);

  const step = steps[currentStep];
  const progressValue = useMemo(
    () => Math.round(((currentStep + 1) / Math.max(steps.length, 1)) * 100),
    [currentStep, steps.length],
  );

  function persist(partial: Partial<WalkthroughProgress>) {
    if (typeof window === "undefined") {
      return;
    }

    const existing = readProgress(storageKey) ?? {
      version: "v1",
      completedStepIds: [],
    };

    const next: WalkthroughProgress = {
      ...existing,
      ...partial,
      version: "v1",
      completedStepIds:
        partial.completedStepIds ??
        Array.from({ length: Math.max(currentStep, 0) }, (_, index) => index),
    };

    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setHasSavedState(Boolean(next.dismissedAt || next.completedAt));
  }

  function handleDismiss() {
    persist({ dismissedAt: new Date().toISOString() });
    setIsOpen(false);
  }

  function handleNext() {
    if (currentStep >= steps.length - 1) {
      persist({
        completedAt: new Date().toISOString(),
        dismissedAt: undefined,
        completedStepIds: steps.map((_, index) => index),
      });
      setIsOpen(false);
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    persist({
      completedStepIds: Array.from({ length: nextStep }, (_, index) => index),
      dismissedAt: undefined,
    });
  }

  function handleReplay() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setCurrentStep(0);
    setHasSavedState(false);
    setIsOpen(true);
  }

  if (!isOpen) {
    return (
      <div className="flex justify-start">
        <Button variant="outline" size="sm" shape="pill" onClick={handleReplay}>
          <Sparkles className="size-4" />
          {hasSavedState ? "Replay walkthrough" : "Open walkthrough"}
        </Button>
      </div>
    );
  }

  return (
    <Card className="rounded-3xl border-primary/15 bg-linear-to-br from-primary/[0.08] via-background to-background shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-3.5" />
              Guided walkthrough
            </div>
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              {title}
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            shape="pill"
            onClick={handleDismiss}
            aria-label="Dismiss walkthrough"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Badge variant="secondary">{progressValue}% complete</Badge>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-primary/10 bg-background/80 p-5">
          <p className="font-heading text-lg font-semibold tracking-tight">
            {step.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            shape="pill"
            onClick={() => setCurrentStep((value) => Math.max(value - 1, 0))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" shape="pill" onClick={handleDismiss}>
              Dismiss
            </Button>
            <Button shape="pill" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Finish walkthrough
                </>
              ) : (
                <>
                  Next step
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
