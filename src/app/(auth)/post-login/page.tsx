import { redirect } from "next/navigation";
import { getServerSession } from "@/shared/infra/supabase/session";
import { api } from "@/trpc/server";

/**
 * Post-login redirect handler.
 * Routes users to the correct portal based on their portal preference and role:
 * - Admin → /admin
 * - Owner (portal_preference = 'owner') → /organization or /organization/get-started
 * - Customer (portal_preference = 'customer') → / (home)
 * - Legacy (null portal_preference) → check org existence for backward compat
 */
export default async function PostLoginPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "admin") {
    redirect("/admin");
  }

  // Explicit portal preference takes priority
  if (session.portalPreference === "customer") {
    redirect("/");
  }

  if (session.portalPreference === "owner") {
    const caller = await api();
    try {
      await caller.organization.mine();
      redirect("/organization");
    } catch {
      redirect("/organization/get-started");
    }
  }

  // Legacy accounts (null portal_preference): check org existence
  const caller = await api();
  try {
    await caller.organization.mine();
    redirect("/organization");
  } catch {
    redirect("/");
  }
}
