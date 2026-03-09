import { requireAdminSession } from "@/shared/infra/supabase/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
