import { requireAdminSession } from "@/shared/infra/supabase/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return <DashboardShell sidebar={<AdminSidebar />}>{children}</DashboardShell>;
}
