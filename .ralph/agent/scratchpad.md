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
