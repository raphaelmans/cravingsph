import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface DashboardNavbarProps {
  breadcrumbs?: BreadcrumbSegment[];
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardNavbar({
  breadcrumbs,
  actions,
  className,
}: DashboardNavbarProps) {
  return (
    <header
      data-slot="dashboard-navbar"
      className={cn(
        "flex min-h-14 shrink-0 flex-wrap items-center gap-x-2 gap-y-2 border-b px-4 py-2",
        className,
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            {breadcrumbs.map((segment, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <Fragment key={segment.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem className="min-w-0">
                    {isLast || !segment.href ? (
                      <BreadcrumbPage className="truncate">
                        {segment.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className="truncate" href={segment.href}>
                        {segment.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {actions && (
        <div className="flex w-full items-center justify-start gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}
