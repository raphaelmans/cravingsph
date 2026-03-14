# Project Summary: Branch Ops Portal + Owner Console IA + Team Scope

## Artifacts

```
.agents/planning/2026-03-14-branch-ops-owner-console/
├── rough-idea.md                          Consolidated rough idea from both proposals
├── idea-honing.md                         Requirements clarification (skipped — jumped to design)
├── research/
│   ├── current-auth-model.md              Current flat auth system, gaps identified
│   ├── current-owner-console.md           Sidebar structure, 5-level deep routes, N+1 data fetching
│   ├── branch-data-model.md               Schema, slug scoping, module structure
│   ├── feature-flags.md                   No infra exists, recommended approach
│   ├── middleware-proxy-auth.md            Layered defense-in-depth, route protection
│   └── external-references.md             shadcn patterns, RBAC best practices
├── design/
│   └── detailed-design.md                 Full architecture, data models, components, testing
├── implementation/
│   └── plan.md                            14-step incremental plan with checklist
└── summary.md                             This file
```

## Design Overview

Two interconnected features behind 6 feature flags:

1. **Branch Ops Portal** — New `(branch)` route group at `/branch/:portalSlug` with a branch-scoped workspace for daily operations (orders, menu, tables, settings). Reuses existing branch operation components in a new navigation shell.

2. **Owner Console IA + Team Scope** — Restructured sidebar v2 with task-oriented groups, workspace/restaurant switcher, and a Team Access section. New RBAC foundation using membership + scoped assignments with role templates.

### Key Technical Decisions

- **Feature flags:** Env-backed typed config (no third-party service)
- **Branch portal slug:** New `portalSlug` column, globally unique, format `<restaurant-slug>-<branch-slug>`
- **RBAC model:** `team_membership` + `scoped_assignment` tables, role templates, business/branch scope
- **Component reuse:** Branch portal pages wrap existing feature components in a new shell
- **Sidebar v2:** shadcn workspace switcher pattern, coexists with v1 behind flag

## Implementation Plan

14 steps, each producing working, demoable functionality:

| Step | What | Key Deliverable |
|------|------|----------------|
| 1 | Feature flag system | Typed flag config, tRPC query |
| 2 | Portal slug | New column, generation, backfill |
| 3 | Branch portal shell | Route group, layout, auth check |
| 4 | Branch portal nav | Sidebar, bottom nav, branch switcher |
| 5 | Branch portal pages | 5 pages reusing existing components |
| 6 | Owner sidebar v2 | Task-oriented flat groups |
| 7 | Workspace switcher | Restaurant context selector |
| 8 | Branch shortcuts | Owner console → branch portal links |
| 9 | Team access data model | Membership + assignment tables/services |
| 10 | Team invite flow | Owner-initiated invites with role/scope |
| 11 | Team Access UI | Members list, invites, scope visibility |
| 12 | Branch auth middleware | Branch-scoped access enforcement |
| 13 | Smart post-login | Route staff to their branch |
| 14 | Rollout validation | E2E testing, dogfooding, progressive enablement |

## Next Steps

1. Review the detailed design at `design/detailed-design.md`
2. Review the implementation plan at `implementation/plan.md`
3. Begin implementation following the checklist

## Areas That May Need Refinement

- **Permission matrix granularity** — v1 uses role templates; may need per-action permissions later
- **Branch portal slug migration** — backfill script needs testing on production data volume
- **Multi-org support** — current model assumes one org per owner; if that changes, membership model scales but some queries need adjustment
- **Notification system** — invite emails are mentioned but email delivery infrastructure not designed
- **Branch deactivation UX** — what happens in the portal when a branch is deactivated
