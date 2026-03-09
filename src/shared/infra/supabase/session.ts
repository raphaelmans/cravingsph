import { cookies } from "next/headers";
import type { CookieMethodsServer } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/shared/infra/supabase/create-client";
import type { Session, UserRole } from "@/shared/kernel/auth";
import { makeUserRoleRepository } from "@/modules/user-role/factories/user-role.factory";

async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Server Component — ignore
        }
      });
    },
  };

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    cookieMethods,
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    let role: UserRole = "member";
    try {
      const userRole = await makeUserRoleRepository().findByUserId(user.id);
      role = (userRole?.role as UserRole) ?? "member";
    } catch {
      role = "member";
    }

    return { userId: user.id, email: user.email ?? "", role };
  } catch {
    return null;
  }
}

/**
 * Requires an authenticated session. Redirects to login if not authenticated.
 */
export async function requireSession(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Requires an admin session. Redirects to login or home if not authorized.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/");
  }
  return session;
}

export { getServerSession };
