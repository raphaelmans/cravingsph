import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/infra/supabase/session";
import { api } from "@/trpc/server";

/**
 * Post-login redirect handler.
 * Routes users to the correct portal based on their role:
 * - Admin → /admin
 * - Owner (has org) → /organization
 * - Customer (no org) → / (home)
 */
export default async function PostLoginPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  // Check if user has an organization to determine owner vs customer
  const caller = await api();
  try {
    await caller.organization.mine();
    // Has an org → owner portal
    redirect("/organization");
  } catch {
    // No org → customer home
    redirect("/");
  }
}
