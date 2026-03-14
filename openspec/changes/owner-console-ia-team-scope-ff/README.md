# Owner Console IA + Team Scope (FF)

Feature-flagged change proposal to simplify the organization owner sidebar and introduce a clearer team-access/scoping model.

## Why

The current owner sidebar is too nested and mentally expensive for users managing many restaurants and branches. It also does not pair cleanly with the future team/staff scoping model.

## Intent

- restructure owner console navigation around tasks, not deep hierarchy
- reduce sidebar clutter
- prepare a clean place for team access and scoping
- keep rollout isolated behind feature flags

## Flags

- `ff.owner_console_sidebar_v2`
- `ff.owner_team_access`
- `ff.owner_workspace_switcher`

## Included specs

- `specs/owner-console-navigation/spec.md`
- `specs/team-access-scope/spec.md`
- `specs/team-access-hierarchy/spec.md`
- `specs/owner-sidebar-workspace-model/spec.md`
