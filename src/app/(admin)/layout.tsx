import { AdminBottomNav } from "@/components/layout/admin-bottom-nav";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { requireAdminSession } from "@/shared/infra/supabase/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <DashboardShell sidebar={<AdminSidebar />} bottomNav={<AdminBottomNav />}>
      {children}
    </DashboardShell>
  );
}
