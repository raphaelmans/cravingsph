"use client";

import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { CustomerHeader } from "@/components/layout/customer-header";
import {
  PageHeaderProvider,
  useIsTabRoot,
  usePageHeader,
} from "@/components/layout/page-header-context";
import { SubpageHeader } from "@/components/layout/subpage-header";
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

      {/* Header: brand on tab roots, subpage elsewhere */}
      {isTabRoot ? (
        <CustomerHeader />
      ) : pageHeader ? (
        <SubpageHeader title={pageHeader.title} label={pageHeader.label} />
      ) : null}

      {/* Main content with bottom padding for the nav bar */}
      <main id="main-content" className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation — always visible */}
      <CustomerBottomNav />
    </div>
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
