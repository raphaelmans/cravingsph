import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface DashboardNavbarProps {
  breadcrumbs?: BreadcrumbSegment[]
  actions?: React.ReactNode
  className?: string
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
        "flex h-14 shrink-0 items-center gap-2 border-b px-4",
        className
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <BreadcrumbItem key={segment.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  {isLast || !segment.href ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={segment.href}>
                      {segment.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </header>
  )
}
