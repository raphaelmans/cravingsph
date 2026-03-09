# Frontend UI Scaffold — Summary

## Artifacts

| File | Purpose |
|---|---|
| `specs/frontend-ui-scaffold/rough-idea.md` | Original idea and source references |
| `specs/frontend-ui-scaffold/requirements.md` | 11 Q&A decisions shaping the architecture |
| `specs/frontend-ui-scaffold/research/legacy-component-mapping.md` | 13 legacy components mapped with migration strategy |
| `specs/frontend-ui-scaffold/research/reference-patterns.md` | Reference repo sidebar/nav/layout patterns |
| `specs/frontend-ui-scaffold/design.md` | Complete design: routes, components, state, acceptance criteria |
| `specs/frontend-ui-scaffold/plan.md` | 16-step incremental implementation plan |
| `specs/frontend-ui-scaffold/summary.md` | This file |

## Scope

- **4 route groups**: `(public)`, `(auth)`, `(owner)`, `(admin)`
- **~40 routes** across customer, owner, and admin portals
- **~80 components** organized into feature modules
- **All 7 PRD phases** covered in a single scaffold
- **16 implementation steps** — each demoable, building on the previous

## Key Decisions

1. **Strict portal separation** — no switching between customer and owner
2. **Horizontal scroll pill tabs** for menu categories (Figma intent, replaces legacy dropdown)
3. **Single adaptive checkout** — form adapts to dine-in vs pickup
4. **Bottom sheets everywhere** on mobile — consistent with legacy
5. **Wizard + hub** for owner onboarding
6. **Branch-scoped cart** with smart item merging
7. **Mobile-first responsive** for customer, desktop-first for owner/admin
8. **No bill splitting** in this scaffold

## Architecture Highlights

- **Feature modules** under `src/features/` — components, hooks, stores colocated
- **Server state via tRPC + TanStack Query** — no Zustand for server data
- **Client state via Zustand** — cart store only, persisted to localStorage
- **Real-time via Supabase Realtime** — order tracking and owner order inbox
- **Permission-filtered navigation** — owner sidebar adapts to user role

## Suggested Next Steps

1. Review the design document (`design.md`) for completeness
2. Implement Step 1 (foundations) to establish the route structure
3. Steps 2-3 deliver the core menu + cart — the fastest path to a working customer demo
4. Steps 9-13 (owner portal) can be built in parallel with customer steps 4-7
