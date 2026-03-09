"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Organization",
  "Restaurant",
  "Branch",
  "Menu",
  "Payments",
  "Verification",
  "Complete",
];

interface WizardProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function WizardProgress({
  currentStep,
  completedSteps,
}: WizardProgressProps) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="flex items-center gap-1">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={stepNumber}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete || isCurrent
                        ? "bg-primary"
                        : "bg-muted-foreground/25",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent &&
                      !isComplete &&
                      "border-2 border-primary text-primary",
                    !isComplete &&
                      !isCurrent &&
                      "border border-muted-foreground/25 text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="size-3.5" /> : stepNumber}
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isComplete ? "bg-primary" : "bg-muted-foreground/25",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight text-center hidden sm:block",
                  isCurrent
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
