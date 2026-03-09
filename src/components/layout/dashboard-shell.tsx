"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function DashboardShell({
  children,
  sidebar,
  defaultOpen = true,
  className,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {sidebar}
      <SidebarInset>
        <div
          data-slot="dashboard-shell"
          className={cn("flex flex-1 flex-col", className)}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
