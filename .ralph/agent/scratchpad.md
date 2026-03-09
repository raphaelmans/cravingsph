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
