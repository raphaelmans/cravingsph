import { requireSession } from "@/shared/infra/supabase/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OwnerSidebar } from "./sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  // TODO: Check if user has an organization, redirect to get-started if not
  // This will be wired up when the organization query is available in the layout

  return <DashboardShell sidebar={<OwnerSidebar />}>{children}</DashboardShell>;
}
