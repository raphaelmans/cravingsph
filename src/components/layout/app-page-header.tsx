import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppPageHeaderBreadcrumb {
  label: string;
  href?: string;
}

interface AppPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  breadcrumbs?: AppPageHeaderBreadcrumb[];
  backHref?: string;
  actions?: React.ReactNode;
  variant?: "default" | "hero" | "compact";
  className?: string;
}

const variantStyles: Record<
  NonNullable<AppPageHeaderProps["variant"]>,
  {
    root: string;
    title: string;
    description: string;
  }
> = {
  default: {
    root: "rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm md:p-6",
    title: "font-heading text-2xl font-semibold tracking-tight text-balance",
    description: "max-w-3xl text-sm leading-6 text-muted-foreground",
  },
  hero: {
    root: "overflow-hidden rounded-4xl border border-primary/15 bg-linear-to-br from-primary/[0.08] via-background to-background p-6 shadow-sm md:p-8",
    title: "font-heading text-3xl font-semibold tracking-tight text-balance",
    description:
      "max-w-3xl text-sm leading-7 text-muted-foreground md:text-base",
  },
  compact: {
    root: "rounded-3xl border border-border/70 bg-card/95 p-4 shadow-sm",
    title: "font-heading text-xl font-semibold tracking-tight text-balance",
    description: "max-w-3xl text-sm leading-6 text-muted-foreground",
  },
};

export function AppPageHeader({
  title,
  description,
  eyebrow,
  icon,
  breadcrumbs,
  backHref,
  actions,
  variant = "default",
  className,
}: AppPageHeaderProps) {
  const styles = variantStyles[variant];

  return (
    <section
      data-slot="app-page-header"
      data-variant={variant}
      className={cn(styles.root, className)}
    >
      <div className="flex flex-col gap-5">
        {(breadcrumbs?.length || backHref) && (
          <div className="flex flex-wrap items-center gap-3">
            {backHref ? (
              <Button variant="outline" size="icon-sm" shape="pill" asChild>
                <Link href={backHref} aria-label="Go back">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            ) : null}

            {breadcrumbs?.length ? (
              <Breadcrumb className="min-w-0">
                <BreadcrumbList>
                  {breadcrumbs.map((segment, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                      <Fragment key={`${segment.label}-${index}`}>
                        {index > 0 ? <BreadcrumbSeparator /> : null}
                        <BreadcrumbItem className="min-w-0">
                          {isLast || !segment.href ? (
                            <BreadcrumbPage className="truncate">
                              {segment.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              className="truncate"
                              href={segment.href}
                            >
                              {segment.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {icon ? (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {icon}
              </div>
            ) : null}

            <div className="min-w-0 space-y-2">
              {eyebrow ? (
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                  {eyebrow}
                </div>
              ) : null}
              <h1 className={styles.title}>{title}</h1>
              {description ? (
                <div className={styles.description}>{description}</div>
              ) : null}
            </div>
          </div>

          {actions ? (
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
