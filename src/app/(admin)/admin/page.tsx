import type { Metadata } from "next";
import { AdminDashboardPage as AdminDashboardScreen } from "@/features/admin/components/admin-dashboard-page";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "CravingsPH admin overview",
};

export default function AdminDashboardPage() {
  return <AdminDashboardScreen />;
}
