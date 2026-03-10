import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "completed" | "current" | "upcoming";

interface StatusStepProps {
  label: string;
  description?: string;
  state: StepState;
  /** Whether to render the connecting line below this step */
  isLast?: boolean;
}

export function StatusStep({
  label,
  description,
  state,
  isLast = false,
}: StatusStepProps) {
  return (
    <div data-slot="status-step" className="flex gap-3">
      {/* Indicator column: circle + connecting line */}
      <div className="flex flex-col items-center">
        {/* Circle indicator */}
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            state === "completed" && "border-success bg-success text-success-foreground",
            state === "current" && "border-primary bg-primary/10 text-primary",
            state === "upcoming" &&
              "border-muted-foreground/30 bg-muted text-muted-foreground/30",
          )}
        >
          {state === "completed" && <Check className="size-4" />}
          {state === "current" && (
            <span className="size-2.5 animate-pulse rounded-full bg-primary" />
          )}
          {state === "upcoming" && (
            <span className="size-2 rounded-full bg-muted-foreground/30" />
          )}
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            className={cn(
              "mt-1 w-0.5 flex-1 min-h-6 transition-colors",
              state === "completed" ? "bg-success" : "bg-muted",
            )}
          />
        )}
      </div>

      {/* Label column */}
      <div className={cn("pb-6", isLast && "pb-0")}>
        <p
          className={cn(
            "text-sm font-medium leading-7",
            state === "completed" && "text-success",
            state === "current" && "text-foreground",
            state === "upcoming" && "text-muted-foreground",
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
