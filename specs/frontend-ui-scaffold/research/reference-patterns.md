# Reference Repo Patterns (next16bp)

## Route Groups
- `(public)` — No auth, discovery shell
- `(auth)` — Smart route-type router (guest/protected/admin detection via pathname)
- `(owner)` — Server-side org gate + DashboardShell
- `(admin)` — Admin role guard + DashboardShell

## Owner Sidebar Architecture
- **Header**: Org selector dropdown (multi-org) or static (single org)
- **Nav groups**: Static arrays with `PageAccessRule` per item
- **Hierarchy**: SidebarGroup → Collapsible → SidebarMenuSub for venue→court nesting
- **Filtering**: `filterVisibleNavItems()` uses permission context
- **Badges**: `badgeCount` prop on nav items, fetched via query hooks
- **Active detection**: Exact match for dashboard, prefix match for sections

## Permission System
- Access rules: `owner-only | owner-or-manager | permission:<name> | any-member`
- Pure function evaluation: `canAccessPage(context, rule)`
- Nav items filtered at render time

## Onboarding
- `/organization/get-started` — Hub view (card grid, non-linear)
- `/organization/onboarding` — Wizard (linear, step-by-step)
- Setup status query determines which to show
- Get-started nav item hidden once setup complete

## Dashboard Shell Composition
```
DashboardShell → AppShell → SidebarProvider
  ├── Sidebar (header + content + footer)
  ├── SidebarInset (navbar + main content + bottom nav)
  └── FloatingPanel (optional)
```

## Key Adaptation Notes for CravingsPH
- **No portal switching** (strict separation, unlike reference)
- **3-level hierarchy**: Org → Restaurant → Branch (vs Org → Venue → Court)
- **Badge counts**: Pending orders instead of pending reservations
- **Owner preview**: "Preview" button opens public URL (no portal switch)
