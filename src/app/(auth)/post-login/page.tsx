import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/infra/supabase/session";

/**
 * Post-login redirect handler.
 * Routes users to the correct portal based on their role.
 */
export default async function PostLoginPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  // TODO: Check if user has an organization to determine owner vs customer
  // For now, redirect to organization dashboard
  redirect("/organization");
}
