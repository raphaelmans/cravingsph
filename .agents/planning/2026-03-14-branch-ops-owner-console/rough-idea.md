# Rough Idea: Branch Ops Portal + Owner Console IA + Team Scope

## Source

Two inter-related feature-flagged change proposals from `openspec/changes/`:

1. **Branch Ops Portal (FF)** — `openspec/changes/branch-ops-portal-ff/`
2. **Owner Console IA + Team Scope (FF)** — `openspec/changes/owner-console-ia-team-scope-ff/`

## Summary

### Branch Ops Portal

Introduce a branch-scoped operations portal that gives staff a short, memorable entry point (`/branch/:slug`) and a branch-limited workspace for daily operations. Ship in two layers: routing + UX shell first, then branch-scoped staff auth.

Key elements:
- Readable branch URL (`/branch/:slug`) with `<restaurant-name>-<branch-name-or-location>` slug format
- Branch-specific login landing (smart redirect for single-branch users)
- Branch membership and branch role mapping (`branch_manager`, `branch_staff`, `branch_viewer`)
- Branch-limited navigation and permissions
- Existing org owner console remains as the higher-level control surface

### Owner Console IA + Team Scope

Restructure the owner sidebar and console information architecture so multi-restaurant operations feel manageable. Introduce a forward-compatible model for team access and scope assignment.

Key elements:
- Workspace-style sidebar replacing deep nested tree (Overview, Restaurants, Branch Operations, Team Access, Account)
- Workspace/context switcher in sidebar header
- Branch shortcut entry points routing into `/branch/:slug`
- Team access foundation with membership + scoped assignments model
- User-facing RBAC hierarchy: Platform → Business → Branch (simplified from internal Platform → Organization → Restaurant → Branch)
- Role templates: `business_owner`, `business_manager`, `business_viewer`, `branch_manager`, `branch_staff`, `branch_viewer`
- Role template + scope as two independent dimensions

### Feature Flags

Branch Ops Portal:
- `ff.branch_ops_portal`
- `ff.branch_scoped_staff_access`
- `ff.branch_portal_short_routes`

Owner Console:
- `ff.owner_console_sidebar_v2`
- `ff.owner_team_access`
- `ff.owner_workspace_switcher`

### Non-goals (v1)

- Custom branch subdomains
- Public branch vanity links outside ops use
- Replacing the owner org console
- Full RBAC permissions matrix UI
- Per-user custom permission checkbox explosion
- Org chart / HR-style people directory

### Open Questions (from proposals)

1. Slug collision fallback: readable suffix vs internal ID
2. Branch staff invite flow: existing admin/owner flow or new branch-specific flow?
3. Should one-branch users skip org console entirely after login?
4. Minimum branch portal v1 nav items: Overview, Orders, Tables, Menu, Settings?
5. Workspace switcher scope: restaurants only, or both restaurants and branches?
6. Team Access launch: business level first, branch scope in detail pages?
7. Implementation order: sidebar v2 first, or scoped team data model first?
