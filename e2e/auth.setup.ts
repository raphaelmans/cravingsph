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
    .from("profile")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase
      .from("profile")
      .update({ portal_preference: preference })
      .eq("user_id", userId);
  } else {
    await supabase
      .from("profile")
      .insert({ user_id: userId, portal_preference: preference });
  }
}

/**
 * Seed a restaurant with tables for the e2e-owner.
 * Mirrors the same logic as scripts/seed-restaurant.ts using the Supabase
 * admin client. Idempotent — skips rows that already exist (matched by slug/code).
 */
async function seedOwnerRestaurant(ownerUserId: string) {
  const supabase = createAdminSupabase();

  // 1. Ensure user_role = owner
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", ownerUserId)
    .single();

  if (!existingRole) {
    await supabase
      .from("user_roles")
      .insert({ user_id: ownerUserId, role: "owner" });
  }

  // 2. Upsert organization
  let { data: org } = await supabase
    .from("organization")
    .select("id")
    .eq("slug", "e2e-test-org")
    .single();

  if (!org) {
    const { data: inserted } = await supabase
      .from("organization")
      .insert({
        owner_id: ownerUserId,
        name: "E2E Test Org",
        slug: "e2e-test-org",
        description: "Organization for E2E testing",
      })
      .select("id")
      .single();
    org = inserted;
  }
  if (!org) throw new Error("Failed to create organization");

  // 3. Upsert restaurant
  let { data: restaurant } = await supabase
    .from("restaurant")
    .select("id")
    .eq("slug", "e2e-test-restaurant")
    .single();

  if (!restaurant) {
    const { data: inserted } = await supabase
      .from("restaurant")
      .insert({
        organization_id: org.id,
        name: "E2E Test Restaurant",
        slug: "e2e-test-restaurant",
        description: "Restaurant for E2E table management tests",
        cuisine_type: "Filipino",
      })
      .select("id")
      .single();
    restaurant = inserted;
  }
  if (!restaurant) throw new Error("Failed to create restaurant");

  // 4. Upsert branch
  let { data: branch } = await supabase
    .from("branch")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("slug", "e2e-main-branch")
    .single();

  if (!branch) {
    const { data: inserted } = await supabase
      .from("branch")
      .insert({
        restaurant_id: restaurant.id,
        name: "E2E Main Branch",
        slug: "e2e-main-branch",
        city: "Cebu",
        province: "Cebu",
        address: "123 Test St, Cebu City",
        is_active: true,
        is_ordering_enabled: true,
      })
      .select("id")
      .single();
    branch = inserted;
  }
  if (!branch) throw new Error("Failed to create branch");

  // 5. Seed category + one menu item (so branch has content)
  let { data: category } = await supabase
    .from("category")
    .select("id")
    .eq("branch_id", branch.id)
    .eq("name", "Main Dishes")
    .single();

  if (!category) {
    const { data: inserted } = await supabase
      .from("category")
      .insert({
        branch_id: branch.id,
        name: "Main Dishes",
        sort_order: 0,
      })
      .select("id")
      .single();
    category = inserted;
  }

  if (category) {
    const { data: existingItem } = await supabase
      .from("menu_item")
      .select("id")
      .eq("category_id", category.id)
      .eq("name", "E2E Test Dish")
      .single();

    if (!existingItem) {
      await supabase.from("menu_item").insert({
        category_id: category.id,
        name: "E2E Test Dish",
        description: "A simple test dish",
        base_price: "150.00",
        sort_order: 0,
      });
    }
  }

  // 6. Seed tables (same shape as le-petit-bistro fixture)
  const tables = [
    { label: "Table 1", code: "T-01", sort_order: 0 },
    { label: "Table 2", code: "T-02", sort_order: 1 },
    { label: "Table 3", code: "T-03", sort_order: 2 },
    { label: "Table 4", code: "T-04", sort_order: 3 },
    { label: "Table 5", code: "T-05", sort_order: 4 },
  ];

  for (const t of tables) {
    const { data: existing } = await supabase
      .from("branch_table")
      .select("id")
      .eq("branch_id", branch.id)
      .eq("code", t.code)
      .single();

    if (!existing) {
      await supabase.from("branch_table").insert({
        branch_id: branch.id,
        label: t.label,
        code: t.code,
        is_active: true,
        sort_order: t.sort_order,
      });
    }
  }

  // 7. Seed active table sessions (T-01 and T-03)
  for (const code of ["T-01", "T-03"]) {
    const { data: table } = await supabase
      .from("branch_table")
      .select("id")
      .eq("branch_id", branch.id)
      .eq("code", code)
      .single();

    if (table) {
      const { data: existingSession } = await supabase
        .from("table_session")
        .select("id")
        .eq("branch_table_id", table.id)
        .eq("status", "active")
        .single();

      if (!existingSession) {
        await supabase.from("table_session").insert({
          branch_table_id: table.id,
          status: "active",
          opened_by: ownerUserId,
          note: `E2E session for ${code}`,
        });
      }
    }
  }

  console.log(
    "Owner seed complete: org, restaurant, branch, 5 tables, 2 sessions",
  );
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
  await seedOwnerRestaurant(userId);
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
