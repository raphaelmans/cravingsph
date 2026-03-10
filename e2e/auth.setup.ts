import { mkdirSync, writeFileSync } from "node:fs";
import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SECRET_KEY ?? "";

const TEST_CUSTOMER = {
  email: "e2e-customer@test.cravings.ph",
  password: "TestPassword123!",
  portalPreference: "customer",
};

const TEST_OWNER = {
  email: "e2e-owner@test.cravings.ph",
  password: "TestPassword123!",
  portalPreference: "owner",
};

const TEST_ADMIN = {
  email: "e2e-admin@test.cravings.ph",
  password: "TestPassword123!",
  portalPreference: "owner",
  role: "admin",
};

function createAdminSupabase() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function isSupabaseReachable(): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        signal: controller.signal,
        headers: { apikey: serviceKey },
      });
      clearTimeout(timeout);
      if (res.ok) return true;
    } catch {
      // Retry
    }
    if (attempt < 2) await new Promise((r) => setTimeout(r, 1_000));
  }
  return false;
}

async function ensureUser(email: string, password: string) {
  const supabase = createAdminSupabase();
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error)
    throw new Error(`Failed to create user ${email}: ${error.message}`);
  return data.user.id;
}

async function setUserRole(userId: string, role: string) {
  const supabase = createAdminSupabase();
  const { data: existing } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase.from("user_roles").update({ role }).eq("user_id", userId);
  } else {
    await supabase.from("user_roles").insert({ user_id: userId, role });
  }
}

async function setPortalPreference(userId: string, preference: string) {
  const supabase = createAdminSupabase();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase
      .from("profiles")
      .update({ portal_preference: preference })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("profiles")
      .insert({ user_id: userId, portal_preference: preference });
  }
}

/**
 * Sign in by calling the tRPC login endpoint via fetch in the browser context.
 * This bypasses the form entirely (which may not be hydrated in time)
 * and directly triggers the server-side Supabase session cookie creation.
 */
async function loginAndSaveState(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
  storagePath: string,
) {
  // Navigate to the app to establish the browser context on localhost
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Call the tRPC login endpoint directly via fetch in the browser context.
  // tRPC v11 with httpBatchLink accepts raw JSON input for mutations.
  // This sets httpOnly auth cookies via the server response.
  const result = await page.evaluate(
    async ({ email, password }) => {
      const res = await fetch("/api/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      return { status: res.status, body };
    },
    { email, password },
  );

  if (result.status !== 200 || result.body?.error) {
    throw new Error(
      `Login failed for ${email}: ${JSON.stringify(result.body?.error ?? result.body)}`,
    );
  }

  // Reload to confirm auth cookies are active
  await page.reload();
  await page.waitForLoadState("domcontentloaded");
  await page.context().storageState({ path: storagePath });
}

function writeEmptyAuthState(path: string) {
  writeFileSync(path, JSON.stringify({ cookies: [], origins: [] }));
}

// Ensure .auth directory exists
mkdirSync("e2e/.auth", { recursive: true });

setup("authenticate as customer", async ({ page }) => {
  const reachable = await isSupabaseReachable();
  if (!reachable) {
    console.log("Supabase unreachable — skipping customer auth setup");
    writeEmptyAuthState("e2e/.auth/customer.json");
    setup.skip();
    return;
  }

  const userId = await ensureUser(TEST_CUSTOMER.email, TEST_CUSTOMER.password);
  await setPortalPreference(userId, TEST_CUSTOMER.portalPreference);
  await loginAndSaveState(
    page,
    TEST_CUSTOMER.email,
    TEST_CUSTOMER.password,
    "e2e/.auth/customer.json",
  );
});

setup("authenticate as owner", async ({ page }) => {
  const reachable = await isSupabaseReachable();
  if (!reachable) {
    console.log("Supabase unreachable — skipping owner auth setup");
    writeEmptyAuthState("e2e/.auth/owner.json");
    setup.skip();
    return;
  }

  const userId = await ensureUser(TEST_OWNER.email, TEST_OWNER.password);
  await setPortalPreference(userId, TEST_OWNER.portalPreference);
  await loginAndSaveState(
    page,
    TEST_OWNER.email,
    TEST_OWNER.password,
    "e2e/.auth/owner.json",
  );
});

setup("authenticate as admin", async ({ page }) => {
  const reachable = await isSupabaseReachable();
  if (!reachable) {
    console.log("Supabase unreachable — skipping admin auth setup");
    writeEmptyAuthState("e2e/.auth/admin.json");
    setup.skip();
    return;
  }

  const userId = await ensureUser(TEST_ADMIN.email, TEST_ADMIN.password);
  await setUserRole(userId, "admin");
  await setPortalPreference(userId, TEST_ADMIN.portalPreference);
  await loginAndSaveState(
    page,
    TEST_ADMIN.email,
    TEST_ADMIN.password,
    "e2e/.auth/admin.json",
  );
});
