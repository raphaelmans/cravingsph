import "server-only";

import { randomUUID } from "node:crypto";
import type { CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { env } from "@/lib/env";
import { makeProfileRepository } from "@/modules/profile/factories/profile.factory";
import { makeUserRoleRepository } from "@/modules/user-role/factories/user-role.factory";
import { createRequestLogger } from "@/shared/infra/logger";
import { createClient } from "@/shared/infra/supabase/create-client";
import { appRouter } from "@/shared/infra/trpc/root";
import { createCallerFactory } from "@/shared/infra/trpc/trpc";
import type { PortalPreference, Session } from "@/shared/kernel/auth";

const createCaller = createCallerFactory(appRouter);

/**
 * Server-side tRPC caller for use in React Server Components.
 * Cached per request to avoid duplicate context creation.
 */
export const api = cache(async () => {
  const requestId = randomUUID();
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
          // Server Component - ignore
        }
      });
    },
  };

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    cookieMethods,
  );

  let session: Session | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      let role: Session["role"] = "member";
      try {
        const userRole = await makeUserRoleRepository().findByUserId(user.id);
        role = (userRole?.role as Session["role"]) ?? "member";
      } catch {
        role = "member";
      }
      let portalPreference: PortalPreference | null = null;
      try {
        const profileRecord = await makeProfileRepository().findByUserId(
          user.id,
        );
        portalPreference =
          (profileRecord?.portalPreference as PortalPreference) ?? null;
      } catch {
        portalPreference = null;
      }
      session = {
        userId: user.id,
        email: user.email ?? "",
        role,
        portalPreference,
      };
    }
  } catch {
    // No session
  }

  const log = createRequestLogger({
    requestId,
    userId: session?.userId,
    method: "RSC",
    path: "server-caller",
  });

  return createCaller({
    requestId,
    session,
    userId: session?.userId ?? null,
    cookies: cookieMethods,
    origin: env.NEXT_PUBLIC_SUPABASE_URL,
    log,
  });
});
