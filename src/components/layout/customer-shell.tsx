"use client";

import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import {
  PageHeaderProvider,
  useIsTabRoot,
  usePageHeader,
} from "@/components/layout/page-header-context";
import { SubpageHeader } from "@/components/layout/subpage-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Inner shell that reads context (must be inside PageHeaderProvider)
// ---------------------------------------------------------------------------

function ShellInner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isTabRoot = useIsTabRoot();
  const pageHeader = usePageHeader();

  return (
    <SidebarProvider>
      <CustomerSidebar />
      <SidebarInset>
        <div
          data-slot="customer-shell"
          className={cn("flex min-h-svh flex-col bg-background", className)}
        >
          {/* Skip to content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
          >
            Skip to content
          </a>

          {/* Mobile-only header: logo on tab roots, back button on subpages */}
          <div className="md:hidden">
            {isTabRoot ? (
              <CustomerHeader />
            ) : pageHeader ? (
              <SubpageHeader
                title={pageHeader.title}
                label={pageHeader.label}
              />
            ) : null}
          </div>

          <main
            id="main-content"
            className="flex-1 touch-manipulation pb-20 md:pb-0"
          >
            {children}
          </main>

          <CustomerBottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ---------------------------------------------------------------------------
// Public shell wrapping provider
// ---------------------------------------------------------------------------

interface CustomerShellProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomerShell({ children, className }: CustomerShellProps) {
  return (
    <PageHeaderProvider>
      <ShellInner className={className}>{children}</ShellInner>
    </PageHeaderProvider>
  );
}
