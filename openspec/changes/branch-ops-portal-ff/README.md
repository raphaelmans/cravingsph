# Branch Ops Portal (FF)

Feature-flagged change proposal to introduce a cleaner branch-scoped operations portal for restaurant staff and owners.

## Why

Current owner UX is organization/restaurant/branch-path heavy. That works for setup, but it is too cumbersome for daily branch operations and too broad for branch-limited staff.

This change proposes:
- a clean branch-scoped portal entry
- branch-scoped staff access
- simpler daily operations navigation
- safe rollout behind feature flags

## Intent

Separate **owner org console** from **branch ops portal**:
- Owner org console = multi-restaurant, multi-branch management
- Branch ops portal = daily execution for one branch

## Flags

- `ff.branch_ops_portal`
- `ff.branch_scoped_staff_access`
- `ff.branch_portal_short_routes`

## Included specs

- `specs/branch-ops-portal/spec.md`
- `specs/branch-staff-scope/spec.md`
- `specs/branch-portal-routing/spec.md`
