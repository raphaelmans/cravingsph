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
        "flex min-h-14 shrink-0 flex-wrap items-center gap-x-2 gap-y-3 border-b px-4 py-3",
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
                <BreadcrumbItem key={segment.label} className="min-w-0">
                  {i > 0 && <BreadcrumbSeparator />}
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
