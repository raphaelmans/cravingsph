# Branch Ops Portal + Owner Console IA + Team Scope

## Objective

Introduce a branch-scoped operations portal (`/branch/:portalSlug`), restructure the owner console sidebar, and build a team access foundation with scoped role assignments — all behind feature flags for safe rollout.

Two interconnected features:

1. **Branch Ops Portal** — A new `(branch)` route group at `/branch/:portalSlug` giving branch staff a short, memorable workspace for daily operations (orders, menu, tables, settings). Reuses existing branch operation components in a new navigation shell.
2. **Owner Console IA + Team Scope** — Flat task-oriented sidebar v2 with workspace/restaurant switcher, branch shortcuts into the portal, and a Team Access section. New RBAC foundation using membership + scoped assignments with role templates.

## Key Requirements

1. Follow the design and plan in `.agents/planning/2026-03-14-branch-ops-owner-console/`.
2. Apply schema changes with `pnpm db:generate && pnpm db:migrate` (Drizzle migrations).
3. Create feature flag system: env-backed typed config at `src/shared/infra/feature-flags/index.ts` with 6 flags (`FF_BRANCH_OPS_PORTAL`, `FF_BRANCH_SCOPED_STAFF_ACCESS`, `FF_BRANCH_PORTAL_SHORT_ROUTES`, `FF_OWNER_CONSOLE_SIDEBAR_V2`, `FF_OWNER_TEAM_ACCESS`, `FF_OWNER_WORKSPACE_SWITCHER`).
4. Add `portal_slug` column (varchar, globally unique) to branch table. Generate composite slugs as `<restaurant-slug>-<branch-slug>` with collision fallback (append city, then random suffix). Backfill all existing branches.
5. Create `(branch)` route group: layout resolves `portalSlug` → branch, checks auth + membership, renders `BranchPortalShell`. Update `proxy.ts` to protect `/branch/**`. Update `app-routes.ts`.
6. Build branch portal sidebar + bottom nav with 5 items: Overview, Orders, Menu, Tables, Settings. Add branch switcher for multi-branch users. Add "Owner Console" link for owners.
7. Wire branch portal pages by reusing existing components from `src/features/owner/` — refactor shared components into `src/features/branch-operations/` if needed.
8. Create sidebar-v2 at `src/app/(owner)/sidebar-v2.tsx` with 5 groups: Overview, Restaurants, Branch Operations, Team Access, Account. Conditionally render v1/v2 based on flag.
9. Add workspace switcher (restaurant selector) in sidebar-v2 header. Store selection in Zustand or URL param.
10. Wire Branch Operations group: branch shortcuts route to `/branch/:portalSlug` when portal flag on, old URL when off.
11. Create 3 new DB tables: `team_membership` (user_id, organization_id, status), `scoped_assignment` (membership_id, role_template, scope_type, scope_id, status), `team_invite` (organization_id, invited_by, email, token, role_template, scope_type, scope_id, status, expires_at).
12. Create `src/modules/team-access/` module following DDD pattern: repositories, services, DTOs, errors, factories. Key method: `AssignmentService.hasAccess(userId, scopeType, scopeId)`.
13. Build owner-initiated invite flow: create/list/revoke/validate/accept procedures. Accept-invite use case creates membership + assignment in transaction. Add invite landing page at `src/app/(auth)/register/team/page.tsx`.
14. Build Team Access UI at `/organization/team`: members list, invites list, invite form (email + role template + scope picker). Wire to sidebar-v2 Team Access group.
15. Create `branchMiddleware` and `branchProcedure` for branch-scoped authorization. `getBranchAccessLevel()` helper for conditional UI. Update branch portal layout to check membership when `branchScopedStaffAccess` flag is on.
16. Smart post-login redirect: single branch → portal, multiple branches → org dashboard, org owner → org dashboard. `?redirect=` param always takes priority.

## Acceptance Criteria

```gherkin
# AC-001: Feature flags gate all new behavior
Given all FF_ env vars are unset or false
When a user navigates the app
Then all existing behavior is unchanged and no new routes are accessible

# AC-002: Branch portal resolves portal slug
Given a branch with portal_slug "jollibee-makati" exists
When an authenticated owner navigates to /branch/jollibee-makati
Then the branch portal renders with the correct branch context

# AC-003: Branch portal has 5 operational pages
Given an owner is in the branch portal for "jollibee-makati"
When they navigate through Overview, Orders, Menu, Tables, Settings
Then each page renders correctly with data matching the owner console for that branch

# AC-004: Branch portal 404 for invalid slug
Given no branch with portal_slug "nonexistent" exists
When a user navigates to /branch/nonexistent
Then the system returns a 404 page

# AC-005: Branch portal requires auth
Given an unauthenticated user
When they navigate to /branch/jollibee-makati
Then they are redirected to /login with redirect param

# AC-006: Owner sidebar v2 is task-oriented
Given FF_OWNER_CONSOLE_SIDEBAR_V2 is true
When an owner views the console
Then the sidebar shows flat groups: Overview, Restaurants, Branch Operations, Team Access, Account
And the sidebar does not expand into a nested restaurant→branch tree

# AC-007: Workspace switcher filters branches
Given an owner with restaurants "Jollibee" and "Chowking"
When they select "Jollibee" in the workspace switcher
Then the Branch Operations group shows only Jollibee branches

# AC-008: Branch shortcuts route to portal
Given FF_BRANCH_OPS_PORTAL and FF_OWNER_CONSOLE_SIDEBAR_V2 are true
When an owner clicks a branch shortcut in the sidebar
Then they navigate to /branch/:portalSlug (not the old nested URL)

# AC-009: Team membership + scoped assignments work
Given an owner invites staff@example.com as branch_staff for "Jollibee Makati"
When the invitee accepts
Then a team_membership and scoped_assignment record exist
And the staff user can access /branch/jollibee-makati

# AC-010: Branch-scoped staff isolation
Given a staff user assigned only to "Jollibee Makati"
When they try to access /branch/jollibee-bgc
Then the system returns 403 Forbidden

# AC-011: Org owner has implicit full access
Given the organization owner
When they access any branch portal under their org
Then access is granted without requiring explicit team_membership rows

# AC-012: Team Access UI in owner console
Given FF_OWNER_TEAM_ACCESS is true
When an owner navigates to /organization/team
Then they see a members list, can invite new members, and see scoped assignments

# AC-013: Smart post-login for single-branch staff
Given a staff user with exactly one branch assignment
When they log in
Then they land directly in /branch/:portalSlug

# AC-014: Smart post-login preserves redirect param
Given a staff user with a ?redirect=/branch/jollibee-bgc param
When they log in
Then they land on /branch/jollibee-bgc (not their default branch)

# AC-015: Portal slug generated on branch creation
Given an owner creates a new branch "Cebu" for restaurant "Jollibee" (slug: jollibee)
When the branch is saved
Then portal_slug is auto-generated as "jollibee-cebu"

# AC-016: Portal slug collision handling
Given a branch with portal_slug "jollibee-makati" already exists
When another branch would generate the same slug
Then the system appends city or random suffix to produce a unique readable slug

# AC-017: Role template validation
Given an owner invites a user with role_template "business_owner" and scope_type "branch"
When the invite is created
Then the system rejects it as an invalid role/scope combination

# AC-018: Invite lifecycle
Given a pending invite
When the invite expires or is revoked
Then attempting to accept it fails with an appropriate error
```

## Implementation Order

Follow `.agents/planning/2026-03-14-branch-ops-owner-console/implementation/plan.md` steps 1–14 sequentially. Each step builds on the previous and ends with demoable functionality. Do not skip steps.

## Role Templates

| Template | Scope | Description |
|----------|-------|-------------|
| `business_owner` | business | Full org/restaurant/branch management |
| `business_manager` | business | Manage restaurants and branches, no billing |
| `business_viewer` | business | Read-only across the business |
| `branch_manager` | branch | Full control of one branch |
| `branch_staff` | branch | Day-to-day operations (orders, tables) |
| `branch_viewer` | branch | Read-only for one branch |

## References

- `.agents/planning/2026-03-14-branch-ops-owner-console/design/detailed-design.md` — architecture, data models, components, auth model, testing strategy
- `.agents/planning/2026-03-14-branch-ops-owner-console/implementation/plan.md` — 14-step implementation plan with checklist
- `.agents/planning/2026-03-14-branch-ops-owner-console/research/` — 6 research documents covering current auth, sidebar, branch model, feature flags, middleware, external references
- `openspec/changes/branch-ops-portal-ff/` — original branch ops portal specs
- `openspec/changes/owner-console-ia-team-scope-ff/` — original owner console + team scope specs
- `docs/design-system.md` — design system reference

## Notes

- All new behavior MUST be gated behind feature flags. Default all flags to `false`.
- Follow existing module conventions: factory DI, service layer auth checks, transaction wrapping.
- Reuse existing branch operation components — do not duplicate. Extract shared components if tightly coupled to owner console URL params.
- The org owner (`organization.ownerId`) always has implicit `business_owner` access — check in code, don't store as a row.
- Branch portal pages share the same visual system as the owner console (same heading treatment, surface hierarchy, motion rules) but with a different navigation shell.
- Use `pnpm db:generate && pnpm db:migrate` for schema changes (not `db:push`).
- Run `pnpm lint` and `pnpm test:unit` after each step to verify no regressions.
