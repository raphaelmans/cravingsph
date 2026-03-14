import type * as React from "react";
import { cn } from "@/lib/utils";

interface AppEmptyStateProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tone?: "default" | "warm" | "subtle";
  className?: string;
}

const toneStyles: Record<NonNullable<AppEmptyStateProps["tone"]>, string> = {
  default: "border-border/70 bg-card text-card-foreground shadow-sm",
  warm: "border-primary/15 bg-linear-to-br from-primary/[0.08] via-background to-background text-card-foreground shadow-sm",
  subtle: "border-dashed border-border/70 bg-background text-card-foreground",
};

export function AppEmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tone = "default",
  className,
}: AppEmptyStateProps) {
  return (
    <div
      data-slot="app-empty-state"
      data-tone={tone}
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-3xl border px-6 py-10 text-center md:px-8 md:py-12",
        toneStyles[tone],
        className,
      )}
    >
      {icon ? (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-6">
          {icon}
        </div>
      ) : null}

      <div className="max-w-md space-y-2">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description ? (
          <div className="text-sm leading-6 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>

      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
