# Research: Current Owner Console Routing & Sidebar

## Summary

The owner console uses deeply nested UUID-based routes with a hierarchical collapsible sidebar. Branch pages are buried 5 levels deep. No workspace switching exists.

## Route Structure

```
/organization                                           → Dashboard
/organization/get-started                               → Onboarding entry
/organization/onboarding                                → Guided setup
/organization/restaurants                               → Restaurant list
/organization/restaurants/{restaurantId}                 → Restaurant detail
/organization/restaurants/{restaurantId}/branches        → Branch list
/organization/restaurants/{restaurantId}/branches/{branchId}          → Branch overview
/organization/restaurants/{restaurantId}/branches/{branchId}/menu     → Menu management
/organization/restaurants/{restaurantId}/branches/{branchId}/orders   → Orders inbox
/organization/restaurants/{restaurantId}/branches/{branchId}/orders/{orderId} → Order detail
/organization/restaurants/{restaurantId}/branches/{branchId}/settings → Branch settings
/organization/restaurants/{restaurantId}/branches/{branchId}/tables   → Table management
```

**Branch operations are 5 levels deep** from `/organization` root, all using UUIDs.

## Sidebar Architecture

**File:** `src/app/(owner)/sidebar.tsx` (385 lines, client component)

### Current Navigation Structure

```
SIDEBAR HEADER
  └─ Organization name + role badge

SETUP GROUP
  └─ Get Started (shows during onboarding)

OVERVIEW GROUP
  └─ Dashboard (/organization)

RESTAURANTS GROUP (collapsible)
  ├─ Restaurant A (collapsible)
  │   ├─ Branch A-1 → /organization/restaurants/{id}/branches/{id}/menu
  │   └─ Branch A-2 → /organization/restaurants/{id}/branches/{id}/menu
  └─ Restaurant B (collapsible)
      └─ Branch B-1 → /organization/restaurants/{id}/branches/{id}/menu

ACCOUNT GROUP
  └─ Profile (/account/profile)

FOOTER
  └─ User avatar + email + sign out dropdown
```

### Problems

1. **Nested tree grows unbounded** — each new restaurant/branch adds sidebar items
2. **Two collapsible levels** — Restaurant → Branch creates scanning cost
3. **No workspace context** — all restaurants/branches visible simultaneously
4. **Branch is default entry to `/menu`** — no clear branch "home"
5. **No Team Access** — no nav item for team/member management
6. **No Branch Operations** — no task-oriented group for branch tasks

### Data Fetching

Sidebar uses three hooks from `src/features/owner/hooks/use-owner-sidebar-data.ts`:
- `useOrganization()` — fetches org, 5 min cache
- `useRestaurants(orgId)` — fetches all restaurants, 2 min cache
- `useBranches(restaurantId)` — fetches branches per restaurant, 2 min cache

Each `RestaurantSubItem` triggers its own branch fetch — N+1 pattern with many restaurants.

## Layout Protection

**File:** `src/app/(owner)/layout.tsx` (52 lines, server component)

Three checks in order:
1. `requireSession()` — must be authenticated
2. Portal preference — customer accounts redirected to `/`
3. Organization existence — redirects to `/organization/get-started` if no org

**No nested layouts** — single layout wraps all `/organization/**` pages.

## Route Definitions

**File:** `src/common/app-routes.ts`

```typescript
organization: {
  base: "/organization",
  getStarted: "/organization/get-started",
  onboarding: "/organization/onboarding",
  restaurants: "/organization/restaurants",
  payments: "/organization/payments",     // Deprecated
  team: "/organization/team",             // Defined but no page exists
  verify: "/organization/verify",         // Deprecated
  settings: "/organization/settings",
}
```

Note: `team` route is defined in `appRoutes` but **no page exists yet** at `/organization/team`.

## Existing Branch Operations

All branch pages are client components with consistent patterns:

| Page | Key Features |
|------|-------------|
| Branch Overview | Edit form, status badges, tools shortcuts |
| Menu | Category tabs, item cards, variants/modifiers |
| Orders | Inbox/Active/Completed/Cancelled tabs, accept/reject |
| Order Detail | Payment proof, timeline, status progression |
| Settings | Ordering toggle, weekly hours editor, QR preview |
| Tables | Table list, add/edit dialogs, close sessions |

These are **fully functional** and would map directly into a branch portal.
