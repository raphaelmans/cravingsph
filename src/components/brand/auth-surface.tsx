import { CircleHelp } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthSurfaceProps {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  helperLabel?: string;
  helperHref?: string;
  className?: string;
}

export function AuthSurface({
  eyebrow,
  title,
  description,
  children,
  footer,
  helperLabel,
  helperHref,
  className,
}: AuthSurfaceProps) {
  return (
    <div className={cn("w-full max-w-lg", className)}>
      <Card className="overflow-hidden rounded-4xl border-primary/15 bg-background/95 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="space-y-5 border-b border-primary/10 p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="Go to CravingsPH home"
              className="inline-flex items-center gap-3"
            >
              <Logo size="sm" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                {eyebrow}
              </span>
            </Link>

            {helperLabel && helperHref ? (
              <Button variant="ghost" size="sm" shape="pill" asChild>
                <Link href={helperHref}>
                  <CircleHelp className="size-4" />
                  {helperLabel}
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
              {title}
            </h1>
            <div className="max-w-xl text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-7">{children}</CardContent>

        {footer ? (
          <CardFooter className="flex-col items-start gap-3 border-t border-primary/10 bg-muted/20 p-6 md:p-7">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
