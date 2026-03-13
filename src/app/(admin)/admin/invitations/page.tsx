import type { Metadata } from "next";
import { AdminInvitationsPage } from "@/features/admin/components/admin-invitations-page";

export const metadata: Metadata = {
  title: "Invitations | Admin | CravingsPH",
};

export default function InvitationsPage() {
  return <AdminInvitationsPage />;
}
