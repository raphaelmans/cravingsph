# Implementation Plan: Branch Ops Portal + Owner Console IA + Team Scope

## Checklist

- [ ] Step 1: Feature flag system
- [ ] Step 2: Portal slug column, generation, and backfill
- [ ] Step 3: Branch portal route group and layout shell
- [ ] Step 4: Branch portal navigation and page scaffolding
- [ ] Step 5: Branch portal pages (reuse existing components)
- [ ] Step 6: Owner sidebar v2 with task-oriented groups
- [ ] Step 7: Workspace switcher in owner sidebar
- [ ] Step 8: Branch shortcut routing from owner console to branch portal
- [ ] Step 9: Team access data model (membership + scoped assignments)
- [ ] Step 10: Team invite flow (owner-initiated)
- [ ] Step 11: Team Access UI in owner console
- [ ] Step 12: Branch-scoped authorization middleware
- [ ] Step 13: Smart post-login redirect
- [ ] Step 14: Rollout validation and dogfooding

---

## Step 1: Feature flag system

**Objective:** Introduce a typed, env-backed feature flag configuration so all subsequent work can be gated behind flags.

**Implementation guidance:**

Create `src/shared/infra/feature-flags/index.ts` with a `FeatureFlags` interface and a `flags` const that reads from environment variables. Add the six flag env vars (`FF_BRANCH_OPS_PORTAL`, `FF_BRANCH_SCOPED_STAFF_ACCESS`, `FF_BRANCH_PORTAL_SHORT_ROUTES`, `FF_OWNER_CONSOLE_SIDEBAR_V2`, `FF_OWNER_TEAM_ACCESS`, `FF_OWNER_WORKSPACE_SWITCHER`) to the env validation schema in `src/lib/env/`. Default all flags to `false`. Add a `flags.getAll` tRPC public procedure that returns the flag values for client-side consumption, cached aggressively (staleTime 5 minutes).

**Test requirements:**
- Unit test: flag reader returns correct boolean values from env
- Unit test: missing env vars default to `false`
- Unit test: tRPC `flags.getAll` procedure returns correct shape

**Integration with previous work:** This is the foundation step. All subsequent steps gate their behavior behind these flags.

**Demo:** Feature flags are readable from server and client. Setting `FF_BRANCH_OPS_PORTAL=true` in `.env` makes `flags.branchOpsPortal` return `true`. The `flags.getAll` tRPC query returns all flag values.

---

## Step 2: Portal slug column, generation, and backfill

**Objective:** Add a globally-unique `portalSlug` column to the branch table and generate slugs for all existing branches so the branch portal has stable URLs to resolve.

**Implementation guidance:**

Add `portalSlug` as a nullable varchar(400) column to the branch Drizzle schema with a unique index. Create a shared slug utility at `src/shared/kernel/slug.ts` that extracts the existing `generateSlug` pattern into one reusable function (the current codebase has three copies). Write a `generatePortalSlug(restaurantSlug, branchSlug)` function that produces `<restaurant-slug>-<branch-slug>` with collision handling (append city, then random suffix). Update `BranchService.create()` to generate and store `portalSlug` on branch creation. Add a `BranchRepository.findByPortalSlug(portalSlug)` method. Write a Drizzle migration to add the column. Write a seed/backfill script that populates `portalSlug` for all existing branches. After backfill verification, add a second migration to make the column NOT NULL.

**Test requirements:**
- Unit test: `generatePortalSlug` produces correct format
- Unit test: collision fallback appends city, then random suffix
- Unit test: `BranchService.create()` stores portalSlug
- Unit test: `findByPortalSlug` returns correct branch
- Integration test: backfill script populates all branches without collisions

**Integration with previous work:** Builds on the existing branch module. The shared slug utility can replace the duplicated `generateSlug` in organization, restaurant, and branch services (but don't refactor those now — just use the shared one for portal slugs).

**Demo:** Run `pnpm db:migrate` to add the column. Run the backfill script. Query any branch and see a human-readable `portalSlug` like `jollibee-makati`. Create a new branch and verify `portalSlug` is auto-generated. `findByPortalSlug("jollibee-makati")` returns the correct branch record.

---

## Step 3: Branch portal route group and layout shell

**Objective:** Create the `(branch)` route group with a layout that resolves the portal slug, checks auth, and provides branch context to child pages.

**Implementation guidance:**

Create `src/app/(branch)/branch/[portalSlug]/layout.tsx` as a server component. The layout should: (1) check `flags.branchOpsPortal` — return notFound() if disabled, (2) call `requireSession()`, (3) resolve `portalSlug` param to a branch record via `findByPortalSlug`, (4) return notFound() if branch not found, (5) verify the user has access (for now, check org ownership only — branch-scoped auth comes in Step 12), (6) render children wrapped in a `BranchPortalShell` component that provides branch context. Update `src/proxy.ts` to add `/branch/**` to the protected route patterns. Update `src/common/app-routes.ts` to add branch portal route definitions.

**Test requirements:**
- Unit test: layout returns 404 when flag is off
- Unit test: layout returns 404 for invalid portal slug
- Unit test: layout requires authentication
- Integration test: authenticated org owner can access `/branch/:portalSlug`
- Integration test: unauthenticated request redirects to login

**Integration with previous work:** Uses the feature flag system from Step 1 and the portal slug resolution from Step 2.

**Demo:** With `FF_BRANCH_OPS_PORTAL=true`, navigating to `/branch/jollibee-makati` as an authenticated org owner shows a blank shell page (no content pages yet). Navigating to a non-existent slug shows 404. Navigating while logged out redirects to login.

---

## Step 4: Branch portal navigation and page scaffolding

**Objective:** Build the branch portal sidebar/nav component with Overview, Orders, Menu, Tables, and Settings nav items, plus the branch switcher for multi-branch users.

**Implementation guidance:**

Create `src/app/(branch)/branch-portal-sidebar.tsx` as a client component using shadcn Sidebar components. Render five nav items: Overview (`/branch/:slug`), Orders (`/branch/:slug/orders`), Menu (`/branch/:slug/menu`), Tables (`/branch/:slug/tables`), Settings (`/branch/:slug/settings`). Add active state detection via `usePathname()`. Add a branch switcher dropdown in the sidebar header that shows the current branch name and (if user has access to multiple branches) allows switching. The switcher fetches accessible branches via a new `branch.listAccessible` tRPC query that returns branches the current user can access. Add an "Owner Console" link in the sidebar footer that routes to `/organization` — only shown if user has business-scope access or is the org owner. Create `src/app/(branch)/branch-portal-bottom-nav.tsx` for mobile bottom navigation with the same five items. Wire both into the `BranchPortalShell` from Step 3's layout.

**Test requirements:**
- Unit test: sidebar renders all five nav items with correct hrefs
- Unit test: branch switcher shows multiple branches when user has access to more than one
- Unit test: Owner Console link visibility based on access level
- Unit test: mobile bottom nav renders correctly

**Integration with previous work:** Consumes the branch context from Step 3's layout. Uses branch portal slug for link construction.

**Demo:** Navigate to `/branch/jollibee-makati`. See a sidebar (desktop) or bottom nav (mobile) with Overview, Orders, Menu, Tables, Settings. Clicking each item navigates to the correct URL. The branch name shows in the sidebar header. If the user owns multiple branches, the branch switcher dropdown appears.

---

## Step 5: Branch portal pages (reuse existing components)

**Objective:** Wire up the five branch portal pages by reusing existing branch operation components from the owner console, wrapped in the branch portal shell.

**Implementation guidance:**

Create five page files under `src/app/(branch)/branch/[portalSlug]/`:
- `page.tsx` — Branch Overview. Reuse the branch detail/snapshot components from the owner console branch overview page, adapted to read branch context from the layout rather than URL params.
- `orders/page.tsx` and `orders/[orderId]/page.tsx` — Reuse `OrderDashboardTabs` and `OrderDetail` components.
- `menu/page.tsx` — Reuse menu management components (category tabs, item cards, variants/modifiers).
- `tables/page.tsx` — Reuse table list, add/edit dialog components.
- `settings/page.tsx` — Reuse ordering toggle, weekly hours editor, QR preview components.

Each page is a thin wrapper that: (1) reads the branch from layout context/params, (2) passes branch ID and restaurant ID to the existing feature components, (3) adjusts breadcrumbs and page titles for the branch portal context.

Refactor shared components out of `src/features/owner/` into `src/features/branch-operations/` if they're currently tightly coupled to owner console URL params. Otherwise, just pass the required IDs as props.

**Test requirements:**
- Integration test: each branch portal page renders without errors
- Integration test: orders page shows order list for the correct branch
- Integration test: menu page shows menu items for the correct branch
- E2E test: navigate through all five pages in the branch portal, verify content matches the same branch in the owner console

**Integration with previous work:** Pages render inside the branch portal shell from Steps 3-4. Components reuse existing branch operation features. Branch ID comes from portal slug resolution in Step 3.

**Demo:** Full branch portal is navigable. An owner can go to `/branch/jollibee-makati`, see the branch overview, click Orders to see the order inbox, click Menu to manage menu items, click Tables to manage dining tables, click Settings to adjust hours and ordering status. All data matches what the owner console shows for the same branch.

---

## Step 6: Owner sidebar v2 with task-oriented groups

**Objective:** Replace the nested collapsible restaurant→branch sidebar tree with a flat, task-oriented sidebar behind the `ownerConsoleSidebarV2` flag.

**Implementation guidance:**

Create `src/app/(owner)/sidebar-v2.tsx` alongside the existing `sidebar.tsx`. The v2 sidebar uses shadcn Sidebar components with five groups: Overview (Dashboard), Restaurants (All Restaurants link), Branch Operations (branch shortcut list — wired in Step 8), Team Access (Members, Invites — wired in Step 11), Account (Profile). The Branch Operations and Team Access groups show a "Coming soon" or muted placeholder if their respective feature flags (`branchOpsPortal`, `ownerTeamAccess`) are off. In the owner layout, conditionally render `sidebar-v2` or `sidebar` based on `flags.ownerConsoleSidebarV2`. Keep the v1 sidebar fully functional as the fallback.

**Test requirements:**
- Unit test: sidebar-v2 renders five groups with correct labels
- Unit test: flag-off hides v2, shows v1
- Unit test: Branch Operations group respects its own flag
- Unit test: Team Access group respects its own flag
- Integration test: switching flag toggles between sidebar v1 and v2

**Integration with previous work:** Consumes feature flags from Step 1. Coexists with existing sidebar. Layout chooses between them.

**Demo:** With `FF_OWNER_CONSOLE_SIDEBAR_V2=true`, the owner console sidebar shows flat groups instead of the nested tree. Overview → Dashboard. Restaurants → All Restaurants list page. Branch Operations shows placeholder. Team Access shows placeholder. Account → Profile. With flag off, the old nested sidebar appears unchanged.

---

## Step 7: Workspace switcher in owner sidebar

**Objective:** Add a workspace/restaurant switcher to the sidebar v2 header so owners can scope their view to a specific restaurant.

**Implementation guidance:**

Add a `WorkspaceSwitcher` component to the sidebar v2 header. It renders as a shadcn `DropdownMenu` inside a `SidebarMenuButton`. Options: "All Restaurants" (default) plus one entry per restaurant, fetched via the existing `useRestaurants(orgId)` hook. The selected restaurant is stored in a lightweight Zustand store (`useWorkspaceStore`) or URL search param. When a restaurant is selected, the Branch Operations group (Step 8) filters to show only that restaurant's branches. The switcher shows the restaurant name and logo. Gate behind `flags.ownerWorkspaceSwitcher` — if off, the header shows the organization name without a dropdown (current behavior).

**Test requirements:**
- Unit test: switcher renders all restaurants plus "All Restaurants" option
- Unit test: selecting a restaurant updates the workspace context
- Unit test: "All Restaurants" resets to unfiltered view
- Unit test: switcher hidden when flag is off

**Integration with previous work:** Extends sidebar-v2 from Step 6. Uses existing `useRestaurants` hook. Workspace context consumed by Branch Operations group in Step 8.

**Demo:** Owner with multiple restaurants sees a dropdown in the sidebar header. Clicking it shows "All Restaurants", "Jollibee", "Chowking". Selecting "Jollibee" scopes the sidebar context. Selecting "All Restaurants" shows everything. With flag off, no dropdown — just the org name.

---

## Step 8: Branch shortcut routing from owner console to branch portal

**Objective:** Wire the Branch Operations sidebar group to show branch shortcuts that route directly into the branch portal (`/branch/:portalSlug`).

**Implementation guidance:**

In sidebar-v2, the Branch Operations group fetches branches for the selected workspace restaurant (or all restaurants if "All Restaurants" selected). Each branch renders as a `SidebarMenuItem` with the branch name and a right-arrow icon. Clicking a branch shortcut navigates to `/branch/:portalSlug`. If the branch portal flag is off, shortcuts navigate to the existing owner console branch URL instead (`/organization/restaurants/:restaurantId/branches/:branchId`). Add a small "Open in new tab" icon button for each shortcut so owners can keep the console open while managing a branch. Limit the visible list to ~10 branches with a "View all" link to the branches list page if more exist.

**Test requirements:**
- Unit test: shortcuts render branch names
- Unit test: shortcuts link to `/branch/:portalSlug` when portal flag is on
- Unit test: shortcuts link to old owner console URL when portal flag is off
- Unit test: list truncates at 10 with "View all" link
- Unit test: workspace filter scopes the branch list correctly

**Integration with previous work:** Extends sidebar-v2 from Step 6, consumes workspace context from Step 7, links to branch portal from Steps 3-5.

**Demo:** Owner console sidebar v2 shows Branch Operations group with branch names. Clicking "Jollibee Makati" opens `/branch/jollibee-makati` in the branch portal. Using the workspace switcher to select "Chowking" shows only Chowking branches. The full owner console → branch portal navigation loop works end-to-end.

---

## Step 9: Team access data model (membership + scoped assignments)

**Objective:** Create the `team_membership`, `scoped_assignment`, and `team_invite` database tables with their Drizzle schemas, repositories, and services.

**Implementation guidance:**

Create Drizzle schemas in `src/shared/infra/db/schema/`:
- `team-membership.ts` — `team_membership` table with user_id, organization_id, status, joined_at
- `scoped-assignment.ts` — `scoped_assignment` table with membership_id, role_template, scope_type, scope_id, status
- `team-invite.ts` — `team_invite` table with organization_id, invited_by, email, token, role_template, scope_type, scope_id, status, expires_at

Export from `src/shared/infra/db/schema/index.ts`. Run `pnpm db:generate` and `pnpm db:migrate`.

Create the team-access module at `src/modules/team-access/` following the existing DDD pattern:
- `repositories/membership.repository.ts` — CRUD for team_membership. Key methods: `findByUserAndOrg`, `findByOrg`, `create`, `updateStatus`.
- `repositories/assignment.repository.ts` — CRUD for scoped_assignment. Key methods: `findByMembership`, `findByUserAndScope`, `create`, `revoke`.
- `repositories/team-invite.repository.ts` — CRUD for team_invite. Key methods: `findByToken`, `findByOrg`, `create`, `updateStatus`.
- `services/membership.service.ts` — Membership lifecycle: create membership, revoke, find by user for org.
- `services/assignment.service.ts` — Assignment lifecycle: create assignment (validate role_template is valid for scope_type), revoke, check user has access to scope.
- `dtos/` — Zod schemas for create/update inputs, role template enum, scope type enum.
- `errors/team-access.errors.ts` — Error classes as defined in the design.
- `factories/team-access.factory.ts` — DI wiring.

Add a `hasAccess(userId, scopeType, scopeId)` method on `AssignmentService` that checks: (1) is user the org owner? → true, (2) does user have an active membership? (3) does user have a matching scoped assignment? This method will be used by the branch authorization middleware in Step 12.

**Test requirements:**
- Unit test: `MembershipService.create` — creates membership, prevents duplicates (ConflictError)
- Unit test: `MembershipService.revoke` — sets status to revoked
- Unit test: `AssignmentService.create` — validates role template matches scope type (e.g., `branch_staff` requires `branch` scope)
- Unit test: `AssignmentService.hasAccess` — org owner always true, matching assignment true, no assignment false, revoked assignment false
- Unit test: role template validation — rejects invalid combinations (e.g., `business_owner` with `branch` scope)
- Integration test: create membership + assignment → findByUserAndScope returns correct record

**Integration with previous work:** New module following existing architecture patterns. Uses `TransactionManager` from `src/shared/kernel/transaction.ts`. `hasAccess` will be consumed by Step 12.

**Demo:** Using DB Studio or a test script: create a team membership for a user in an organization, assign them `branch_staff` scoped to a specific branch. Query `hasAccess(userId, "branch", branchId)` → returns true. Query for a different branch → returns false. Query for the org owner → returns true without any membership row.

---

## Step 10: Team invite flow (owner-initiated)

**Objective:** Allow organization owners to invite team members with a role template and scope, completing the invite-to-membership lifecycle.

**Implementation guidance:**

Add tRPC procedures to the team-access router (gated behind `flags.ownerTeamAccess`):
- `teamAccess.invite.create` (protectedProcedure) — Owner creates invite with email, role_template, scope_type, scope_id. Validates: user is org owner, role/scope combination is valid, target scope_id belongs to org. Generates cryptographic token (32 bytes hex), sets 7-day expiry. Returns invite record with constructed invite URL.
- `teamAccess.invite.list` (protectedProcedure) — Lists invites for the org, filterable by status.
- `teamAccess.invite.revoke` (protectedProcedure) — Revokes a pending invite.
- `teamAccess.invite.validate` (publicProcedure) — Validates token, returns invite details (for the registration/accept page).
- `teamAccess.invite.accept` (protectedProcedure) — Accepts invite: creates `team_membership` (if not exists) + `scoped_assignment` in a transaction. Sets invite status to `accepted`.

Create an accept-invite use case at `src/modules/team-access/use-cases/accept-invite.use-case.ts` to orchestrate the multi-service flow (check invite valid → create membership → create assignment → mark invite accepted).

Add a team invite landing page at `src/app/(auth)/register/team/page.tsx` that reads the `?token=` param, validates the invite, and either prompts registration (if new user) or shows an accept button (if already logged in).

**Test requirements:**
- Unit test: invite creation validates ownership, role/scope combination, scope target belongs to org
- Unit test: invite token is cryptographically random and unique
- Unit test: invite acceptance creates membership + assignment in transaction
- Unit test: accepting expired invite throws `TeamInviteExpiredError`
- Unit test: accepting already-accepted invite throws error
- Unit test: revoking accepted invite throws error
- Integration test: full flow — create invite → validate token → accept → membership and assignment exist

**Integration with previous work:** Uses team access data model from Step 9. Invite validation page uses existing auth route group patterns. Acceptance use case follows the existing `RegisterUserUseCase` pattern for multi-service orchestration.

**Demo:** Owner creates an invite for `staff@example.com` as `branch_staff` scoped to "Jollibee Makati". System generates an invite URL. Opening the URL shows the invite details (role, branch name). After the invitee registers/logs in and accepts, they appear in the team membership list with the correct scoped assignment. The invite status shows as "accepted".

---

## Step 11: Team Access UI in owner console

**Objective:** Build the Team Access pages in the owner console so owners can view members, manage invites, and see scoped assignments.

**Implementation guidance:**

Create pages under `src/app/(owner)/organization/team/`:
- `page.tsx` — Team members list. Shows all team members with their role template, scope, and status. Uses a table/list layout. Each row shows: member name/email, role template badge, scope label (e.g., "Branch: Jollibee Makati" or "Business-wide"), status badge, actions (revoke). Gate behind `flags.ownerTeamAccess`.
- `invites/page.tsx` — Pending/sent invites list. Shows invite email, role, scope, status, expiry. Actions: revoke, resend (create new invite for same email/role/scope).
- Add an "Invite Member" button/dialog that opens a form: email input, role template select (dropdown of templates), scope type select (Business or Branch), scope target select (branch picker if branch scope). Uses react-hook-form + zod validation.

Wire the Team Access nav items in sidebar-v2 (from Step 6) to link to `/organization/team` and `/organization/team/invites`.

Add tRPC queries:
- `teamAccess.members.list` — lists team memberships with assignments for the org
- `teamAccess.members.revoke` — revokes a membership (cascades to assignments)

**Test requirements:**
- Unit test: members list renders correct data shape
- Unit test: invite form validates email, role template, scope selection
- Unit test: revoke action calls correct mutation
- Integration test: invite creation from UI → appears in invites list
- Integration test: member revocation → membership status changes to revoked
- E2E test: owner invites a team member, sees them in pending invites, member accepts, appears in members list

**Integration with previous work:** Uses team access data model (Step 9), invite flow (Step 10), sidebar-v2 Team Access group (Step 6). Fulfills the `appRoutes.organization.team` route that was defined but had no page.

**Demo:** Owner navigates to Team Access in sidebar. Sees current members (initially just themselves as implicit owner). Clicks "Invite Member", fills in email, selects "Branch Staff" role for "Jollibee Makati". Invite appears in invites list. After the invitee accepts, they appear in the members list with "Branch Staff — Jollibee Makati" scope. Owner can revoke access.

---

## Step 12: Branch-scoped authorization middleware

**Objective:** Enforce branch-level access in the branch portal so that branch-scoped staff can only access their assigned branches.

**Implementation guidance:**

Create `branchMiddleware` in `src/shared/infra/trpc/trpc.ts` (or a separate file). The middleware: (1) extracts branch identifier from input (portalSlug or branchId), (2) resolves the branch record, (3) calls `AssignmentService.hasAccess(userId, "branch", branchId)` from Step 9, (4) if denied, throws `InsufficientBranchAccessError` (403), (5) if allowed, attaches branch record and access level to context. Export `branchProcedure = protectedProcedure.use(branchMiddleware)`.

Update the branch portal layout (`src/app/(branch)/branch/[portalSlug]/layout.tsx`) to check branch access when `flags.branchScopedStaffAccess` is enabled. When the flag is off, fall back to org ownership check only (Step 3 behavior).

Create a `getBranchAccessLevel(userId, branchId)` helper that returns the user's effective role template for a branch, considering: org owner → `business_owner`, business-scoped assignment → their business role, branch-scoped assignment → their branch role, no access → null. Use this in branch portal pages to conditionally show/hide write actions (e.g., `branch_viewer` sees orders but can't accept/reject).

**Test requirements:**
- Unit test: `branchMiddleware` allows org owner
- Unit test: `branchMiddleware` allows user with matching branch assignment
- Unit test: `branchMiddleware` allows user with business-scope assignment
- Unit test: `branchMiddleware` denies user with no membership
- Unit test: `branchMiddleware` denies user with assignment for different branch
- Unit test: `getBranchAccessLevel` returns correct role template for each access path
- Unit test: flag off → falls back to org ownership check only
- Integration test: branch-scoped staff can access their branch portal, get 403 on another branch

**Integration with previous work:** Uses `AssignmentService.hasAccess` from Step 9. Updates branch portal layout from Step 3. Branch portal pages from Step 5 use `getBranchAccessLevel` to show/hide actions.

**Demo:** Invite a user as `branch_staff` for "Jollibee Makati". That user logs in and accesses `/branch/jollibee-makati` — success. They try `/branch/jollibee-bgc` — 403 Forbidden. They can view and accept orders in Makati but cannot edit the menu (branch_staff restriction). An org owner can access all branches.

---

## Step 13: Smart post-login redirect

**Objective:** After login, route users to the most relevant starting point based on their branch memberships and role.

**Implementation guidance:**

Create `src/modules/branch/use-cases/smart-redirect.use-case.ts`. Logic: (1) if `branchOpsPortal` flag is off → current behavior (org dashboard), (2) fetch user's team memberships and assignments, (3) if user is org owner with no staff assignments → `/organization` (current behavior), (4) if user has exactly one branch-scoped assignment → `/branch/:portalSlug`, (5) if user has multiple branch assignments → `/organization` with branch picker (or a new `/branch-picker` page), (6) if user has business-scope assignment → `/organization`.

Update the post-login page at `src/app/(customer)/post-login/page.tsx` (or the relevant redirect logic) to call this use case. Ensure the `?redirect=` query param still takes priority if present (e.g., user was redirected from a specific branch portal URL).

**Test requirements:**
- Unit test: flag off → returns `/organization`
- Unit test: org owner no staff assignments → `/organization`
- Unit test: single branch assignment → `/branch/:portalSlug`
- Unit test: multiple branch assignments → `/organization` (or picker)
- Unit test: business-scope assignment → `/organization`
- Unit test: explicit `?redirect=` param overrides smart redirect
- Integration test: staff user with one branch logs in → lands in branch portal

**Integration with previous work:** Uses team access data model (Step 9), portal slug (Step 2), feature flags (Step 1). Updates the existing post-login flow.

**Demo:** A branch staff user with one branch assignment logs in and lands directly in `/branch/jollibee-makati`. An owner logs in and lands in `/organization` as before. A staff user with three branches logs in and sees the org dashboard with branch shortcuts. Adding `?redirect=/branch/jollibee-bgc` to the login URL overrides the smart redirect.

---

## Step 14: Rollout validation and dogfooding

**Objective:** Validate the full feature set on a test account before progressive rollout.

**Implementation guidance:**

Create a dogfooding checklist document at `.agents/planning/2026-03-14-branch-ops-owner-console/rollout-checklist.md` covering:

**Branch Portal validation:**
- [ ] Create test branch, verify portalSlug is generated
- [ ] Navigate to `/branch/:portalSlug` as org owner — full portal works
- [ ] All five pages render correctly with real data
- [ ] Branch switcher works for multi-branch owner
- [ ] Mobile bottom nav works on small screens
- [ ] Feature flags off → portal returns 404

**Owner Console v2 validation:**
- [ ] Sidebar v2 renders five task groups
- [ ] Workspace switcher filters branches correctly
- [ ] Branch shortcuts route to branch portal
- [ ] Old sidebar still works when flag is off
- [ ] No regression in existing owner console pages

**Team Access validation:**
- [ ] Owner can invite staff with branch scope
- [ ] Owner can invite manager with business scope
- [ ] Invitee receives link, registers, accepts invite
- [ ] Accepted member appears in Team Access list
- [ ] Branch-scoped staff can only access their branch
- [ ] Business-scoped manager can access all branches
- [ ] Revoking access immediately blocks portal access
- [ ] Smart post-login redirect routes staff to correct branch

**Edge cases:**
- [ ] User with both customer and staff access (portal preference handling)
- [ ] Branch deactivation — portal shows appropriate state
- [ ] Invite for already-registered user (skip registration, just accept)
- [ ] Slug collision scenario — fallback produces readable URL
- [ ] Concurrent access — multiple staff on same branch

After validation, progressively enable flags: first for one test restaurant, then for all.

**Test requirements:**
- E2E test suite covering the complete staff journey: invite → register → login → branch portal → manage orders
- E2E test suite covering the complete owner journey: login → sidebar v2 → workspace switch → branch shortcut → branch portal → back to console
- Performance test: sidebar v2 with 20+ restaurants and 50+ branches loads within 2 seconds

**Integration with previous work:** This step validates all previous steps working together end-to-end.

**Demo:** Complete walkthrough on a staging environment: admin creates owner account, owner sets up restaurant + branches, owner invites branch staff, staff registers and lands in branch portal, staff manages orders, owner uses sidebar v2 to jump between branches, all behind feature flags that can be toggled off instantly.
