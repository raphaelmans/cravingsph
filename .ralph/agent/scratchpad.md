# Scratchpad

## Iteration: Step 9a — Enhanced OwnerSidebar

### Understanding
Task 9a requires enhancing the existing basic OwnerSidebar (`src/app/(owner)/sidebar.tsx`) with:
1. **SidebarHeader**: org name + role badge (currently just a Logo)
2. **Collapsible Restaurant→Branch hierarchy**: replace flat "Restaurants" link with nested tree
3. **NavUser footer**: user avatar, name, email, logout dropdown (currently a TODO)

### Available tRPC endpoints
- `organization.mine` → get current user's org
- `restaurant.listByOrganization(orgId)` → list restaurants
- `branch.listByRestaurant(restaurantId)` → list branches per restaurant
- `auth.me` → get session (useSession hook exists)
- `auth.logout` → logout (useLogout hook exists)

### Available UI primitives (all from shadcn)
- Sidebar*, Collapsible*, DropdownMenu*, Avatar*
- SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuAction

### Plan
1. Create `src/features/owner/hooks/use-owner-sidebar-data.ts` — fetches org + restaurants + branches
2. Rewrite `src/app/(owner)/sidebar.tsx` with enhanced header, hierarchy, and footer
3. Verify with typecheck + lint

### Result
- Committed as 3fdc715
- Task closed: task-1773059425-b2d0
- Next: Step 9b (owner layout org gate) is now unblocked

## Iteration: Step 9b — Owner layout org gate

### Understanding
The owner layout needs a server-side org check:
- If user has no organization, redirect to `/organization/get-started`
- Exempt onboarding routes (`get-started`, `onboarding`) from this check
- Use direct service call (not tRPC) — faster for server-only checks
- `x-pathname` header is already set by proxy (Next.js 16 middleware equiv)

### Plan
1. Update `src/app/(owner)/layout.tsx` — add org gate with `makeOrganizationService`
2. Create `src/app/(owner)/organization/get-started/page.tsx` — stub page so redirect has a target
3. Verify with typecheck + lint

### Result
- Committed as 1dae12c
- Task closed: task-1773059434-0427
- Implementation: direct service call (not tRPC), uses `x-pathname` header from proxy, exempts onboarding routes
- Next: Step 9c (owner dashboard page) is now unblocked

## Iteration: Step 9c — Owner dashboard page

### Understanding
Replace the placeholder dashboard at `src/app/(owner)/organization/page.tsx` with:
1. **DashboardNavbar** breadcrumb header ("Dashboard")
2. **Stat cards grid**: Total orders today, pending orders, active branches, revenue today
3. **Quick links section**: common actions (Add Restaurant, Manage Menu, View Orders, Team, Payment Settings)

Since we're scaffolding the UI and don't have dedicated `order.stats` or `order.pendingCount` tRPC procedures yet, stat cards will use data from existing sidebar hooks (restaurants, branches) where possible and show placeholder/stub values for order/revenue stats that don't have backend endpoints yet.

### Plan
1. Rewrite `src/app/(owner)/organization/page.tsx` — stat cards grid + quick links
2. Use `useOrganization` + `useRestaurants` hooks for real data (branch count)
3. Stub order/revenue stats with TODO comments for future backend wiring
4. Verify with typecheck + lint

### Result
- Committed as 9b4c948
- Task closed: task-1773059444-a985
- Dashboard has: DashboardNavbar breadcrumb, 4 stat cards (orders/pending/locations/revenue), 5 quick action links
- Active Locations card wired to real restaurant count; order/revenue stats stubbed with "--" pending backend
- Step 9 complete (9a sidebar + 9b org gate + 9c dashboard). Next: Step 10 (onboarding)

## Iteration: Step 10a — Onboarding hub page (get-started)

### Understanding
Step 10 has two parts:
- **Hub page** (`/organization/get-started`) — card grid showing 7 setup steps with completion status
- **Wizard page** (`/organization/onboarding`) — linear 7-step wizard with entity forms

The hub page currently exists as a stub (rocket icon + "Start Setup Wizard" button). Need to:
1. Derive completion status by querying existing entities (org, restaurant, branch, menu)
2. Show a grid of 7 SetupCards with status badges
3. Show progress overview ("X of 7 complete")
4. Each card links to relevant section or wizard step

### Available tRPC hooks (from use-owner-sidebar-data.ts)
- `useOrganization()` → org existence = step 1 complete
- `useRestaurants(orgId)` → restaurant existence = step 2 complete
- `useBranches(restaurantId)` → branch existence = step 3 complete
- Menu/payment/verification steps = check pending (future backend)

### Plan
Task 10a: Onboarding hub — SetupCard + rewrite get-started page
Task 10b: Onboarding wizard — WizardProgress + WizardStep + 7 step forms

Starting with Task 10a this iteration.

### Result
- Committed as 0a98fcd
- Task closed: task-1773060404-6693
- Created: `src/features/onboarding/hooks/use-onboarding-status.ts` — derives step completion from existing tRPC queries
- Created: `src/features/onboarding/components/setup-card.tsx` — card with icon, title, description, status badge
- Rewrote: `src/app/(owner)/organization/get-started/page.tsx` — hub with header, progress bar, 7-card grid, wizard CTA
- Next: Task 10b (onboarding wizard page) is now unblocked

## Iteration: Step 10b — Onboarding wizard page

### Understanding
Build the wizard page at `/organization/onboarding` with:
- **WizardProgress** component — horizontal step indicator (7 steps)
- **WizardStep** wrapper — renders the appropriate form for the current step
- **7 step forms**: OrganizationForm, RestaurantForm, BranchForm, MenuBuilderStep (stub), PaymentMethodsStep (stub), VerificationStep (stub), CompletionStep

### Data flow
- Step tracked via URL search params (`?step=1` through `?step=7`)
- Step 1: Creates org (if not exists), pre-populates from `cravings:pending-org-name` localStorage
- Step 2: Creates restaurant with org ID from existing query
- Step 3: Creates branch with restaurant ID from existing query
- Steps 4-6: Placeholder stubs (backend not ready)
- Step 7: Completion summary + redirect to dashboard

### Key patterns (from codebase research)
- Forms: react-hook-form + zodResolver + shadcn Form components
- tRPC mutations: `useTRPC()` → `useMutation()` with `mutationOptions()`
- Cache invalidation: `getQueryClient().invalidateQueries()`
- Zod schemas: CreateOrganizationSchema, CreateRestaurantSchema, CreateBranchSchema exist in DTOs
- Entity forms should be reusable for standalone CRUD pages later (Step 13)

### Plan
1. Create `src/features/onboarding/components/wizard-progress.tsx`
2. Create `src/features/onboarding/components/organization-form.tsx` (Step 1)
3. Create `src/features/onboarding/components/restaurant-form.tsx` (Step 2)
4. Create `src/features/onboarding/components/branch-form.tsx` (Step 3)
5. Create `src/features/onboarding/components/menu-builder-step.tsx` (Step 4 stub)
6. Create `src/features/onboarding/components/payment-methods-step.tsx` (Step 5 stub)
7. Create `src/features/onboarding/components/verification-step.tsx` (Step 6 stub)
8. Create `src/features/onboarding/components/completion-step.tsx` (Step 7)
9. Create `src/app/(owner)/organization/onboarding/page.tsx` — wizard orchestrator
10. Verify typecheck + lint

### Result
- Committed as 9557e41
- Task closed: task-1773060409-b056
- Created: `src/features/onboarding/components/wizard-progress.tsx` — horizontal step indicator with 7 steps
- Created: `src/features/onboarding/components/organization-form.tsx` — org creation with localStorage pre-fill
- Created: `src/features/onboarding/components/restaurant-form.tsx` — restaurant creation with full form fields
- Created: `src/features/onboarding/components/branch-form.tsx` — branch creation with address/province/city
- Created: `src/features/onboarding/components/menu-builder-step.tsx` — stub (skip for now)
- Created: `src/features/onboarding/components/payment-methods-step.tsx` — stub (skip for now)
- Created: `src/features/onboarding/components/verification-step.tsx` — stub (skip for now)
- Created: `src/features/onboarding/components/completion-step.tsx` — success + dashboard link
- Created: `src/app/(owner)/organization/onboarding/page.tsx` — wizard orchestrator with URL-based step tracking
- Step 10 complete (10a hub + 10b wizard). Next: Step 11 (owner menu management)

## Iteration: Step 11a — Menu management page + item cards

### Understanding
Step 11 builds the CRUD interface for managing categories, items, variants, and modifiers.
Route: `/organization/restaurants/[restaurantId]/branches/[branchId]/menu`

### Data model
- `getManagementMenu(branchId)` returns `FullMenu = MenuCategoryWithItems[]`
- Each category has `items: MenuItemWithDetails[]`
- Each item has `variants: ItemVariantRecord[]` and `modifierGroups: ModifierGroupWithModifiers[]`
- All mutations exist in `menu.*` tRPC router

### Task breakdown
- **11a**: Menu management page + useManagementMenu hook + MenuItemManagementCard + category tabs + availability toggle
- **11b**: AddCategoryDialog + delete category action
- **11c**: AddItemDialog + EditItemDialog
- **11d**: VariantsDialog + ModifierGroupDialog

### Plan for 11a
1. Create `src/features/menu-management/hooks/use-management-menu.ts` — wraps `menu.getManagementMenu`
2. Create `src/features/menu-management/components/menu-item-card.tsx` — card with image, name, price, availability Switch, actions DropdownMenu
3. Create `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/menu/page.tsx` — page with DashboardNavbar, category tabs, item grid
4. Verify typecheck + lint


## 2026-03-09 Step 12c

- Ready task in prompt is `task-1773062482-cfc2` even though `ralph tools task ready` returned none; `ralph tools task list` confirms the task exists and is open.
- Scope for this iteration: finish owner order-detail Step 12c by wiring `PaymentProofReview` and `OrderTimeline` into the detail page and provide enough stubbed hook data for the page to render a believable review state.
- Existing presentational components already exist in `src/features/order-management/components/`, but the route page still had a placeholder and `useOrderDetail` / `useOrderTimeline` returned `null` / `[]`.
- Implemented a small shared in-memory store in `use-order-management.ts` so the owner detail page, payment review actions, order acceptance/rejection, and status updates all mutate a common stub state without backend procedures.
- Verification: `npx tsc --noEmit` passed; targeted `npx biome check` passed for the touched Step 12c files; repo-wide `npx biome check` still has unrelated existing failures outside this task.

## 2026-03-09 Step 13a

- No runtime tasks existed, so Step 13 was split into five tasks: payments, team, branch settings, verification, and restaurant/branch CRUD.
- Chosen task for this iteration: `task-1773065808-9108` (`/organization/payments`), because it is self-contained and unblocks the owner dashboard quick link without depending on backend procedures that do not exist yet.
- Research notes:
  - `organizationRouter` only exposes `mine`, `create`, and `update`; organization schema/DTO currently has no payment-method fields.
  - Existing customer payment UI already provides a presentational `PaymentMethod` shape and card styling, but it is read-only and uses hardcoded stub data.
  - Owner portal currently has no files under `src/app/(owner)/organization/payments`, so the route still 404s.
- Plan for this iteration:
  1. Add a local payment-config hook/store using `useSyncExternalStore` so add/edit/remove/default actions stay interactive without backend support.
  2. Create owner-facing config components under `src/features/payment-config/components/`.
  3. Add `src/app/(owner)/organization/payments/page.tsx` with header, summary, list state, and add-method CTA.
  4. Verify with `npx tsc --noEmit` and targeted `npx biome check`, then commit and close only Step 13a.

### Result
- Committed as `958e7b7`
- Task closed: `task-1773065808-9108`
- Created `src/features/payment-config/hooks/use-payment-config.ts` with a shared in-memory payment-method store and add/edit/remove/default actions.
- Created `src/features/payment-config/components/payment-method-card.tsx` and `src/features/payment-config/components/add-payment-method-dialog.tsx`.
- Created `src/app/(owner)/organization/payments/page.tsx` with DashboardNavbar breadcrumbs, summary cards, configured methods list, and empty/add states.
- Verification: `npx tsc --noEmit` passed; targeted `npx biome check` passed for the four Step 13a files.
- Next unblocked tasks: `task-1773065808-83e8` (team), `task-1773065808-837c` (branch settings), `task-1773065808-99d9` (verification), `task-1773065808-9eaa` (restaurant/branch CRUD).

## 2026-03-09 Step 13c

- Chosen task for this iteration: `task-1773065808-837c` (`/organization/restaurants/[restaurantId]/branches/[branchId]/settings`).
- Spec scope: branch settings page with weekly hours editor, order settings (online ordering, auto-accept, payment countdown), QR preview/download, and customer preview CTA.
- Research notes:
  - `branch` schema already has real `isOrderingEnabled`, `autoAcceptOrders`, and `paymentCountdownMinutes` fields, and `branch.update` exposes them through the protected tRPC router.
  - No schema or procedures exist yet for weekly operating hours, so that part still needs a frontend scaffold store similar to the Step 13a payments page.
  - No QR library is currently installed; generating a real downloadable QR is cleaner than a placeholder because the Step 13 spec explicitly calls for generate/download behavior.
- Plan for this iteration:
  1. Add a branch-settings hook that loads the selected branch from existing protected queries, persists real order-setting changes through `branch.update`, and keeps weekly hours in a local per-branch store.
  2. Create `src/features/branch-settings/components/weekly-hours-editor.tsx` and `src/features/branch-settings/components/qr-code-preview.tsx`.
  3. Add `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx` with DashboardNavbar breadcrumbs, summary cards, settings sections, and preview action.
  4. Verify with `npx tsc --noEmit` and targeted `npx biome check`, then commit and close only Step 13c.

### Result
- Committed as `b92dbab`
- Task closed: `task-1773065808-837c`
- Added `src/features/branch-settings/hooks/use-branch-settings.ts` combining real branch/order-setting queries and mutations with a per-branch local weekly-hours store.
- Added `src/features/branch-settings/components/weekly-hours-editor.tsx` and `src/features/branch-settings/components/qr-code-preview.tsx`.
- Added `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx` with summary cards, real order-setting persistence, QR download/print actions, and customer preview CTA.
- Added `qrcode` and `@types/qrcode` to support real QR generation in the owner portal scaffold.
- Verification: `npx tsc --noEmit` passed; targeted `npx biome check` passed for the four Step 13c files.
- Remaining ready tasks: `task-1773065808-99d9` (verification) and `task-1773065808-9eaa` (restaurant/branch CRUD).

## 2026-03-09 Step 13d

- Chosen task for this iteration: `task-1773065808-99d9` (`/organization/verify`).
- Spec scope: owner verification page with document upload form and status display.
- Research notes:
  - Step 13 explicitly places the route at `src/app/(owner)/organization/verify/page.tsx`; the current sidebar already links there, but the route does not exist yet.
  - The only real verification-backed field in the current model is `restaurant.verificationStatus`; there are no upload procedures or document tables yet.
  - Existing owner Step 13 scaffolds use `useSyncExternalStore` to keep interactive UX working when the backend is not ready, while still reading real tRPC data where possible.
- Plan for this iteration:
  1. Add a verification hook/store that reads the owner organization and restaurants, derives a primary verification status from real restaurant data, and keeps uploaded document metadata in a local shared store.
  2. Create owner-facing verification UI components for status summary and document checklist/upload cards.
  3. Add `src/app/(owner)/organization/verify/page.tsx` with DashboardNavbar breadcrumbs, status cards, requirements guidance, and submit/resubmit actions.
  4. Verify with `npx tsc --noEmit` and targeted `npx biome check`, then commit and close only Step 13d.

### Result
- Committed as `4117b32`
- Task closed: `task-1773065808-99d9`
- Added `src/features/verification/hooks/use-owner-verification.ts` with a per-restaurant `useSyncExternalStore` scaffold layered on top of real organization/restaurant queries.
- Added `src/features/verification/components/verification-restaurant-card.tsx` and `src/features/verification/components/verification-document-card.tsx`.
- Added `src/app/(owner)/organization/verify/page.tsx` with multi-restaurant status cards, contact details, document uploads, reviewer notes, and submit/resubmit actions.
- Fixed the owner sidebar verification nav target to use `appRoutes.organization.verify`, so the new route is reachable from the shell.
- Verification: `npx tsc --noEmit` passed; targeted `npx biome check` passed for the five Step 13d files.
- Remaining ready task: `task-1773065808-9eaa` (restaurant/branch CRUD).

## 2026-03-09 Step 13e

- Chosen task for this iteration: `task-1773065808-9eaa` (`/organization/restaurants` CRUD flow).
- Spec scope: add the four owner restaurant management pages:
  - `src/app/(owner)/organization/restaurants/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/page.tsx`
  - Reuse onboarding `RestaurantForm` and `BranchForm`
- Research notes:
  - Current onboarding forms only support create mode, but the router already exposes real `restaurant.update` and `branch.update` mutations.
  - Existing owner pages use `DashboardNavbar`, real tRPC queries where available, and local scaffolds only where backend support is missing. CRUD does not need a local scaffold because list/create/update already exist.
  - No dedicated `getById` query exists, so edit pages should derive the selected entity from the organization-scoped and restaurant-scoped list queries.
- Plan for this iteration:
  1. Refactor `RestaurantForm` and `BranchForm` into reusable create/edit forms with `mode`, initial values, and update mutation support while preserving onboarding behavior.
  2. Add a small owner management hook layer for organization, restaurants, selected restaurant, and selected branch lookups.
  3. Create the four owner pages with list cards, empty states, edit surfaces, and links into menu/orders/settings where useful.
  4. Verify with `npx tsc --noEmit` and targeted `npx biome check`, then commit and close only Step 13e.

### Result
- Added `src/features/restaurant-management/hooks/use-owner-restaurant-management.ts` to centralize organization, restaurant, and branch lookups for the owner CRUD surfaces.
- Added `src/features/restaurant-management/components/restaurant-overview-card.tsx` and `src/features/restaurant-management/components/branch-overview-card.tsx` for the list views.
- Added the four Step 13e routes:
  - `src/app/(owner)/organization/restaurants/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/page.tsx`
  - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/page.tsx`
- Refactored onboarding `RestaurantForm` and `BranchForm` to support both create and edit modes with shared validation and real `restaurant.update` / `branch.update` mutations.
- Verification:
  - `npx next typegen` passed
  - `npx tsc --noEmit` passed
  - targeted `npx biome check ...` passed for the Step 13e files
  - `npm run build` still fails for an unrelated existing `/search` Suspense boundary issue; recorded as memory `mem-1773067136-fb20` and follow-up task `task-1773067136-2dd4`

## 2026-03-09 Build fix — /search suspense boundary

- Chosen task for this iteration: `task-1773067136-2dd4` (`/search` suspense boundary build failure).
- Research notes:
  - Production build failure was reproduced previously as: `useSearchParams() should be wrapped in a suspense boundary at page "/search" during prerender`.
  - `src/app/(public)/search/page.tsx` is a `"use client"` page that calls `useSearchParams()` at the page root.
  - `src/app/(owner)/organization/onboarding/page.tsx` already uses the safe pattern: move `useSearchParams()` into a child component and wrap that child in `<Suspense>`.
- Plan for this iteration:
  1. Refactor `src/app/(public)/search/page.tsx` into a `SearchPageContent` client component and keep the route export as a small `Suspense` shell.
  2. Add a lightweight fallback that preserves the current layout enough for prerender without reading search params.
  3. Run targeted `npx biome check` on the search page and `npm run build` to verify the backpressure failure is cleared.

### Result
- Committed as `9071c14`
- Task closed: `task-1773067136-2dd4`
- Refactored `src/app/(public)/search/page.tsx` to move `useSearchParams()` into `SearchPageContent` and export a `Suspense`-wrapped page shell with a simple loading fallback.
- Verification:
  - `npx biome check 'src/app/(public)/search/page.tsx'` passed
  - `npm run build` passed, and `/search` now prerenders as a static route without the Suspense error

## 2026-03-09 Step 14a

- No runtime tasks were ready, so Step 14 was split into four admin tasks:
  - `task-1773067378-b6d5` dashboard + sidebar badges
  - `task-1773067378-b6d3` verification queue + review
  - `task-1773067378-c209` restaurant management
  - `task-1773067378-c5bb` user management
- Chosen task for this iteration: `task-1773067378-b6d5` (`/admin` dashboard + admin sidebar badges).
- Research notes:
  - `src/app/(admin)/layout.tsx` and `src/app/(admin)/sidebar.tsx` already exist from the earlier shell work, but the dashboard page is still a placeholder and the sidebar has no badge counts.
  - There is no `adminRouter` yet in `src/shared/infra/trpc/root.ts`; current routers only cover auth/profile/organization/restaurant/branch/menu.
  - The repo already has the required tables to derive dashboard counts: `restaurant`, `organization`, `branch`, and `user_roles` (plus `authUsers` re-exported from the user role schema).
  - `createContext()` already enriches sessions with `session.role`, so Step 14a can add an admin-only tRPC procedure instead of leaning on hardcoded UI-only data.
- Plan for this iteration:
  1. Add a minimal admin router/service layer for dashboard overview data and an explicit admin-role procedure guard.
  2. Create `src/features/admin/hooks/use-admin-portal.ts` and move the sidebar implementation into `src/features/admin/components/admin-sidebar.tsx`.
  3. Replace the placeholder `src/app/(admin)/admin/page.tsx` with real stat cards and a recent-activity scaffold sourced from the new admin overview query.
  4. Verify with `npx tsc --noEmit`, targeted `npx biome check`, and `npm run build`, then commit and close only Step 14a.

### Result
- Committed as `d4acd0e`
- Completed task: `task-1773067378-b6d5`
- Added a new `admin` module:
  - `src/modules/admin/admin.router.ts`
  - `src/modules/admin/factories/admin.factory.ts`
  - `src/modules/admin/repositories/admin.repository.ts`
  - `src/modules/admin/services/admin.service.ts`
- Added `adminProcedure` in `src/shared/infra/trpc/trpc.ts` and mounted `adminRouter` in `src/shared/infra/trpc/root.ts` so admin-only dashboard data now flows through tRPC instead of hardcoded page state.
- Added admin feature-layer files:
  - `src/features/admin/hooks/use-admin-portal.ts`
  - `src/features/admin/components/admin-sidebar.tsx`
  - `src/features/admin/components/admin-dashboard-page.tsx`
  - `src/features/admin/components/admin-dashboard-stat-card.tsx`
  - `src/features/admin/components/admin-recent-activity-feed.tsx`
- Updated `src/app/(admin)/layout.tsx` to use the feature-owned sidebar and replaced the placeholder `src/app/(admin)/admin/page.tsx` with the new dashboard shell.
- Sidebar now shows the pending verification badge from real admin overview data.
- Dashboard now shows real counts for restaurants, pending verifications, and user roles, plus a recent activity feed from recent restaurant records. `Orders Today` remains intentionally unavailable because the repo still has no order schema/procedures.
- Verification:
  - `npx tsc --noEmit` passed
  - `npx biome check ...` passed for the touched admin files
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed
- Next ready tasks remain the rest of Step 14:
  - `task-1773067378-b6d3` verification queue + review
  - `task-1773067378-c209` restaurant management
  - `task-1773067378-c5bb` user management

## 2026-03-09 Step 14b

- Chosen task for this iteration: `task-1773067378-b6d3` (`/admin/verification` queue + `/admin/verification/[requestId]` review).
- Research notes:
  - Step 14b requires real admin-only approve/reject behavior, and the dashboard/sidebar from Step 14a already established the `adminProcedure` + `adminRouter` path to build on.
  - The current data model has no verification request or document table yet; the real persisted signal is `restaurant.verificationStatus`, plus restaurant/org/profile contact fields.
  - The owner verification page already seeds believable document/contact state from restaurant status using a shared `useSyncExternalStore` scaffold; admin review can mirror that seeded document shape while persisting approve/reject through a real restaurant status mutation.
  - The spec route uses `[requestId]`, but without a dedicated verification-request entity the safest current mapping is to treat `requestId` as the restaurant id for this scaffold.
- Plan for this iteration:
  1. Extend the admin repository/service/router with verification queue, verification detail, and approve/reject procedures backed by real restaurant data and status updates.
  2. Add admin verification hooks/components for queue cards/table and review panels, seeding document/contact metadata from the same restaurant status assumptions already used on the owner side.
  3. Add `src/app/(admin)/admin/verification/page.tsx` and `src/app/(admin)/admin/verification/[requestId]/page.tsx`, then verify with `npx tsc --noEmit`, targeted `npx biome check`, and `npm run build`.

### Result
- Committed as `fb84f1e`
- Completed task: `task-1773067378-b6d3`
- Extended the admin module with verification-specific DTOs and procedures:
  - `admin.getVerificationQueue`
  - `admin.getVerificationRequest`
  - `admin.updateVerificationStatus`
- Added real admin repository/service support for verification queue lookups and approve/reject persistence through `restaurant.verificationStatus`, with owner/org/profile joins for review context.
- Added admin verification UI:
  - `src/features/admin/hooks/use-admin-verification.ts`
  - `src/features/admin/components/admin-verification-request-card.tsx`
  - `src/features/admin/components/admin-verification-document-card.tsx`
  - `src/features/admin/components/admin-verification-queue-page.tsx`
  - `src/features/admin/components/admin-verification-review-page.tsx`
- Added the two Step 14b routes:
  - `src/app/(admin)/admin/verification/page.tsx`
  - `src/app/(admin)/admin/verification/[requestId]/page.tsx`
- Verification:
  - `npx biome check ...` passed for the 12 touched Step 14b files
  - `npx tsc --noEmit` passed
  - `npm run build` passed and included `/admin/verification` plus `/admin/verification/[requestId]`
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
- Follow-up context:
  - The route param still maps `requestId` to `restaurant.id` because the repo has no dedicated verification-request table yet.
  - Document files and review notes remain scaffolded from the existing owner verification requirements until backend document storage exists.

## 2026-03-09 Step 14c

- Chosen task for this iteration: `task-1773067378-c209` (`/admin/restaurants` + `/admin/restaurants/[id]`).
- Research notes:
  - Step 14c requires an all-restaurants admin list with status filtering plus a detail page that supports admin edit, feature toggle, and deactivate.
  - The existing owner restaurant/branch CRUD forms are reusable for the text-edit surface, but owner tRPC procedures enforce organization ownership and do not expose admin-only fields like `isFeatured` or `isActive`.
  - The admin module from Steps 14a and 14b is the correct extension point for this work because it already has `adminProcedure`, repository/service wiring, and real restaurant-backed queries.
  - `restaurant` already has the persisted fields needed for this scope: `verificationStatus`, `isFeatured`, `isActive`, contact fields, and timestamps. There is still no order-backed signal, so restaurant management should stay focused on listing, editing profile fields, and status toggles.
- Plan for this iteration:
  1. Extend the admin repository/service/router with restaurant list, restaurant detail, and restaurant update procedures backed by the real `restaurant` table.
  2. Add admin restaurant hooks/components for the filterable list, restaurant detail summary, and a lightweight admin edit form that reuses the existing restaurant field shape while exposing admin-only featured/active toggles.
  3. Add `src/app/(admin)/admin/restaurants/page.tsx` and `src/app/(admin)/admin/restaurants/[id]/page.tsx`.
  4. Verify with `npx tsc --noEmit`, targeted `npx biome check`, `npx vitest run --passWithNoTests`, and `npm run build`, then commit and close only Step 14c.

### Result
- Committed as `bdf2e0a`
- Completed task: `task-1773067378-c209`
- Extended the admin module with restaurant management procedures:
  - `admin.getRestaurants`
  - `admin.getRestaurant`
  - `admin.updateRestaurant`
- Added real admin repository/service support for restaurant list/detail reads and admin-side updates to `name`, `description`, `cuisineType`, `phone`, `email`, `isFeatured`, and `isActive`, plus branch count lookup for the detail view.
- Added admin restaurant UI:
  - `src/features/admin/hooks/use-admin-restaurants.ts`
  - `src/features/admin/components/admin-restaurant-list-card.tsx`
  - `src/features/admin/components/admin-restaurant-management-page.tsx`
  - `src/features/admin/components/admin-restaurant-detail-page.tsx`
  - `src/features/admin/components/admin-restaurant-profile-form.tsx`
- Added the two Step 14c routes:
  - `src/app/(admin)/admin/restaurants/page.tsx`
  - `src/app/(admin)/admin/restaurants/[id]/page.tsx`
- Added `appRoutes.admin.restaurant(id)` so the new admin list and detail views share a typed route helper.
- Verification:
  - `npx tsc --noEmit` passed
  - targeted `npx biome check ...` passed for the Step 14c files
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and included `/admin/restaurants` plus `/admin/restaurants/[id]`
- Remaining ready task: `task-1773067378-c5bb` (admin user management page)

## 2026-03-09 Step 14d

- Chosen task for this iteration: `task-1773067378-c5bb` (`/admin/users` user management page).
- Research notes:
  - Step 14d only requires one route, `src/app/(admin)/admin/users/page.tsx`, with search and a deactivate action.
  - The existing admin module already owns the right backend path: `adminProcedure` + `adminRouter` + admin repository/service. Reusing that keeps the admin portal consistent with Steps 14a–14c.
  - Real persisted user data exists across `auth.users`, `profile`, and `user_roles`. `auth.users` exposes `email`, `phone`, `lastSignInAt`, `createdAt`, and `updatedAt`; `profile` adds display name and avatar/contact details; `user_roles` provides the assigned platform role.
  - There is still no persisted deactivation/disabled flag in the repo schema, and no existing auth admin integration for suspending accounts. The safest pattern is to read the user list from real tables, then keep deactivation/reactivation interactive in a local `useSyncExternalStore` layer until a backend user-status field exists.
- Plan for this iteration:
  1. Extend the admin repository/service/router with an admin user list query backed by `auth.users`, `profile`, and `user_roles`.
  2. Add an admin user-management hook that combines the real query with a local per-user active-status scaffold plus search/filter helpers.
  3. Create the admin user list card/page and the `/admin/users` route, matching the existing admin dashboard shell and sidebar patterns.
  4. Verify with `npx tsc --noEmit`, targeted `npx biome check`, `npx vitest run --passWithNoTests`, and `npm run build`, then commit and close only Step 14d.

### Result
- Committed as `a5f86f5`
- Completed task: `task-1773067378-c5bb`
- Extended the admin module with a new real user-management query:
  - `admin.getUsers`
- Added real admin repository/service support for listing platform users from `auth.users`, `profile`, and `user_roles`, normalizing email and phone fields for the admin UI.
- Added admin user-management UI:
  - `src/features/admin/hooks/use-admin-users.ts`
  - `src/features/admin/components/admin-user-table.tsx`
  - `src/features/admin/components/admin-user-management-page.tsx`
- Added the Step 14d route:
  - `src/app/(admin)/admin/users/page.tsx`
- The `/admin/users` page now includes:
  - search by name/email/phone/role
  - role and access-state filters
  - stat cards for total users, admins, active access, and recent sign-ins
  - a table with contact details, last sign-in data, and deactivate/reactivate actions
- Deactivate/reactivate is intentionally scaffolded with `useSyncExternalStore` because the repo still has no persisted user suspension field or Supabase admin integration; the user list itself is real backend data.
- Verification:
  - `npx biome check 'src/modules/admin/admin.router.ts' 'src/modules/admin/services/admin.service.ts' 'src/modules/admin/repositories/admin.repository.ts' 'src/features/admin/hooks/use-admin-users.ts' 'src/features/admin/components/admin-user-table.tsx' 'src/features/admin/components/admin-user-management-page.tsx' 'src/app/(admin)/admin/users/page.tsx'` passed
  - `npx tsc --noEmit` passed
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and included `/admin/users`
- Step 14 is now complete across dashboard, verification, restaurant management, and user management. The next iteration can create the Step 15 retention-page tasks.

## 2026-03-09 Step 15a

- Chosen task for this iteration: `task-1773069088-c690` (`/orders` order history, reorder, and review flow).
- Research notes:
  - `src/common/app-routes.ts` and `src/proxy.ts` already classify `/orders` as a protected customer route, so the missing work is the page and feature state rather than auth gating.
  - There is no customer order or review router yet. The repo already uses shared `useSyncExternalStore` scaffolds for owner orders, verification, payments, and admin user activation, so Step 15a should follow the same pre-backend pattern instead of inventing unstable fake tRPC procedures.
  - The persisted cart is already branch-scoped and merges identical items via `src/features/cart/stores/cart.store.ts`, which is the right foundation for reorder.
  - Public restaurant pages are server-rendered from `restaurant.getBySlug`, so read-only customer reviews need to be exposed through a client component mounted inside `src/app/(public)/restaurant/[slug]/page.tsx`.
- Plan for this iteration:
  1. Add a customer orders feature module with local in-memory order/review state, seeded order history, and a reorder action that writes into the existing cart store while skipping unavailable items.
  2. Build `src/app/(public)/orders/page.tsx` plus `order-history-card` and `review-sheet`, keeping the page mobile-first and customer-styled with pill actions.
  3. Add a read-only restaurant reviews component to the public restaurant page so submitted reviews appear immediately after the order-history flow.
  4. Verify with targeted `npx biome check`, `npx tsc --noEmit`, and `npm run build`, then commit and close only Step 15a.

### Result
- Committed as `d0ea7cb`
- Completed task: `task-1773069088-c690`
- Added the new customer retention order-history surface:
  - `src/features/orders/hooks/use-customer-orders.ts`
  - `src/features/orders/components/customer-orders-page.tsx`
  - `src/features/orders/components/order-history-card.tsx`
  - `src/features/orders/components/review-sheet.tsx`
  - `src/features/orders/components/restaurant-reviews.tsx`
  - `src/app/(public)/orders/page.tsx`
- The `/orders` page is now a protected customer route with:
  - seeded order-history cards
  - reorder actions that reuse the persisted cart store
  - cart replacement when switching restaurants
  - unavailable-item skip warnings
  - drawer-based review submission for completed orders
- Updated `src/app/(public)/restaurant/[slug]/page.tsx` to mount read-only customer reviews beneath the menu so submitted reviews surface immediately in the public restaurant experience.
- Verification:
  - `npx biome check 'src/features/orders/hooks/use-customer-orders.ts' 'src/features/orders/components/order-history-card.tsx' 'src/features/orders/components/review-sheet.tsx' 'src/features/orders/components/restaurant-reviews.tsx' 'src/features/orders/components/customer-orders-page.tsx' 'src/app/(public)/orders/page.tsx' 'src/app/(public)/restaurant/[slug]/page.tsx'` passed
  - `npx tsc --noEmit` passed
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and now includes static `/orders`
- Follow-up context:
  - Step 15a intentionally uses a local `useSyncExternalStore` scaffold because `order.myOrders` and `review.create/listByRestaurant` do not exist yet.
  - Reorder currently uses seeded order item availability rather than live menu validation because the customer order module does not yet have real persisted menu snapshots or backend order procedures.

## 2026-03-09 Step 15b

- Chosen task for this iteration: `task-1773069091-773c` (`/saved` saved restaurants page).
- Research notes:
  - `src/common/app-routes.ts` and `src/proxy.ts` already classify `/saved` as a protected customer route, so the missing work is the feature state and page UI, not auth middleware.
  - There is no `savedRestaurant.toggle` procedure or public restaurant listing router yet. The only public restaurant server query is `restaurant.getBySlug`, while discovery/search still use stub preview arrays.
  - Step 15a established the current retention pattern: use a local `useSyncExternalStore` scaffold for customer-only retention features until the backend procedures exist, while keeping interactions realistic and persisted where possible.
  - To satisfy the Step 15 test requirement that save/unsave toggles persist, this iteration should use a browser-backed scaffold rather than purely in-memory seeded state.
- Plan for this iteration:
  1. Add a `saved-restaurants` feature module with a `useSyncExternalStore` + `localStorage` scaffold, seeded favorite restaurant metadata, and save/unsave helpers for future reuse.
  2. Build a customer-styled `/saved` page and vertical saved-restaurant cards with view-menu and unsave actions, matching the existing pill-button retention UI.
  3. Verify with targeted `npx biome check`, `npx tsc --noEmit`, `npx vitest run --passWithNoTests`, and `npm run build`, then commit and close only Step 15b.

### Result
- Completed task: `task-1773069091-773c`
- Added the new saved-restaurants customer retention surface:
  - `src/features/saved-restaurants/hooks/use-saved-restaurants.ts`
  - `src/features/saved-restaurants/components/saved-restaurant-card.tsx`
  - `src/features/saved-restaurants/components/saved-restaurants-page.tsx`
  - `src/app/(public)/saved/page.tsx`
- The `/saved` page is now a protected customer route with:
  - a persisted `localStorage` + `useSyncExternalStore` favorites scaffold
  - seeded saved restaurant metadata sorted by save date
  - view-menu and unsave actions on each card
  - hero stats plus an empty state when all saved restaurants are removed
- Verification:
  - `npx biome check 'src/features/saved-restaurants/hooks/use-saved-restaurants.ts' 'src/features/saved-restaurants/components/saved-restaurant-card.tsx' 'src/features/saved-restaurants/components/saved-restaurants-page.tsx' 'src/app/(public)/saved/page.tsx'` passed
  - `npx next typegen` passed and refreshed Next route types for the new route
  - `npx tsc --noEmit` passed
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and now includes static `/saved`
- Follow-up context:
  - This iteration intentionally keeps saved restaurants in a local persisted scaffold because `savedRestaurant.toggle` and any public restaurant-list query do not exist yet.
  - The hook exposes save/toggle helpers as the future integration point for restaurant-card or restaurant-page bookmark actions.

## 2026-03-09 Step 15c

- Chosen task for this iteration: `task-1773069094-3078` (`/account` customer account page).
- Research notes:
  - Step 15c is narrower than 15a/15b: the spec only calls for a protected `/account` page with profile fields (`name`, `phone`, `email`) plus logout.
  - Unlike orders and saved restaurants, this slice already has real backend support: `auth.me`, `auth.logout`, `profile.me`, and `profile.update` all exist and are wired through TanStack Query hooks.
  - The existing `ProfileForm` is owner-portal styled and card-based; the customer surface should instead match the mobile-first retention pages with pill controls, warm background treatment, and quick links back to `/orders` and `/saved`.
- Plan for this iteration:
  1. Add a `customer-account` feature module with a customer-specific editable profile form backed by the real profile query/mutation and the real logout mutation.
  2. Add `src/app/(public)/account/page.tsx` and keep the route client-rendered like the other protected customer pages.
  3. Verify with targeted `npx biome check`, `npx next typegen`, `npx tsc --noEmit`, `npx vitest run --passWithNoTests`, and `npm run build`, then commit and close only Step 15c.

### Result
- Completed task: `task-1773069094-3078`
- Added the new customer account surface:
  - `src/features/customer-account/components/customer-profile-form.tsx`
  - `src/features/customer-account/components/customer-account-page.tsx`
  - `src/app/(public)/account/page.tsx`
- The `/account` page now uses real protected auth/profile data and includes:
  - customer-styled hero/account summary
  - editable pill-shaped name, email, and phone fields backed by `profile.update`
  - quick links to `/saved` and `/orders`
  - real logout via `auth.logout` with redirect back to login
- Verification:
  - `npx biome check 'src/features/customer-account/components/customer-profile-form.tsx' 'src/features/customer-account/components/customer-account-page.tsx' 'src/app/(public)/account/page.tsx'` passed
  - `npx next typegen` passed
  - `npx tsc --noEmit` passed
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and now includes static `/account`
- Step 15 is now complete across `/orders`, `/saved`, and `/account`. The remaining blocked work is Step 16 polish, waiting on other prerequisite tasks outside this loop.

## 2026-03-09 Step 16

- Chosen task for this iteration: `task-1773069097-1fd9` (`Step 16: Polish pass`).
- Research notes:
  - The remaining Step 16 requirements are cross-cutting rather than feature-specific: shared loading states, route-group error boundaries, responsive fine-tuning, and public metadata.
  - Most page components already embed local skeletons for query-driven loading, but the route tree only has one actual `loading.tsx` file and no `error.tsx` files under `src/app/`, so navigation and unexpected failures still fall back to generic Next behavior.
  - The highest-leverage responsive issue is the shared `DashboardNavbar`: on narrower owner/admin widths, breadcrumbs and action badges compete for horizontal space because the header is locked to a single row.
  - Public SEO is still under-specified. Root metadata exists, but the discovery funnel and dynamic restaurant page do not expose page-level metadata yet.
- Plan for this iteration:
  1. Add shared polish primitives for route loading and route errors, then wire them into `(public)`, `(auth)`, `(owner)`, and `(admin)` via route-group `loading.tsx` and `error.tsx`.
  2. Tighten the shared dashboard navbar for tablet/mobile widths so breadcrumbs and action content wrap cleanly without clipping.
  3. Add page metadata for the public discovery/search flow plus dynamic restaurant metadata, then verify with targeted lint, typecheck, tests, and production build before committing and closing only Step 16.

### Result
- Committed as `7268ad4`
- Completed task: `task-1773069097-1fd9`
- Added shared Step 16 polish primitives:
  - `src/components/feedback/public-page-loading.tsx`
  - `src/components/feedback/auth-page-loading.tsx`
  - `src/components/feedback/dashboard-page-loading.tsx`
  - `src/components/feedback/route-error-state.tsx`
- Added route-group loading and error boundaries:
  - `src/app/(public)/loading.tsx`
  - `src/app/(public)/error.tsx`
  - `src/app/(auth)/loading.tsx`
  - `src/app/(auth)/error.tsx`
  - `src/app/(owner)/loading.tsx`
  - `src/app/(owner)/error.tsx`
  - `src/app/(admin)/loading.tsx`
  - `src/app/(admin)/error.tsx`
- Improved shared responsiveness by updating `src/components/layout/dashboard-navbar.tsx` so breadcrumbs truncate and action content wraps cleanly on narrower owner/admin widths.
- Added public metadata coverage:
  - generic discovery metadata in `src/app/(public)/layout.tsx`
  - search metadata in `src/app/(public)/search/layout.tsx`
  - dynamic restaurant metadata plus ISR revalidation in `src/app/(public)/restaurant/[slug]/page.tsx`
  - root `metadataBase` in `src/app/layout.tsx`
- Verification:
  - `npx biome check ...` passed for the 17 Step 16 files
  - `npx tsc --noEmit` passed
  - `npx vitest run --passWithNoTests` passed (`1` file, `3` tests)
  - `npm run build` passed and now includes the full public, owner, and admin route tree with the new route-group fallbacks in place
- Notes:
  - No Playwright or Lighthouse automation exists in this repo yet, so the Step 16 accessibility/responsive audit remains a code-level/manual polish pass rather than a scripted browser suite.

## 2026-03-09 Loop completion

- Checked `ralph tools task ready` at the start of the iteration: no ready tasks remain for this objective.
- The prior completion signal failed as `event.malformed`; this was an event-writing issue, not unfinished product work.
- Plan for this iteration: record completion status here and re-emit `LOOP_COMPLETE` with `ralph emit` so the loop closes through the supported event path.
