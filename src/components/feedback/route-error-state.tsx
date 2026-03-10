"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RouteErrorStateProps {
  title: string;
  description: string;
  retry: () => void;
  homeHref: string;
  homeLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  shape?: "default" | "pill";
  className?: string;
}

export function RouteErrorState({
  title,
  description,
  retry,
  homeHref,
  homeLabel,
  secondaryHref,
  secondaryLabel,
  shape = "default",
  className,
}: RouteErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex min-h-svh items-center justify-center bg-gradient-to-b from-peach/50 via-background to-background px-4 py-10",
        className,
      )}
    >
      <Card className="w-full max-w-xl overflow-hidden border-border bg-background/95 shadow-xl backdrop-blur">
        <CardHeader className="items-center gap-4 border-b bg-peach/40 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-2">
            <Logo />
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 text-center">
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={retry} shape={shape}>
              <RotateCcw className="size-4" />
              Try again
            </Button>

            <Button asChild shape={shape} variant="outline">
              <Link href={homeHref}>
                <Home className="size-4" />
                {homeLabel}
              </Link>
            </Button>

            {secondaryHref && secondaryLabel ? (
              <Button asChild shape={shape} variant="ghost">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
