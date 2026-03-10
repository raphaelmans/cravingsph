## Context

The repository currently includes a broad ordering/discovery surface plus owner/admin modules, while alignment decisions lock this release to Track A (table-first dine-in with immutable submitted tickets). Current public menu paths can expose checkout without table capability and some customer flows are still stubbed.

## Goals / Non-Goals

**Goals:**
- Guarantee that dine-in ordering requires validated table capability.
- Keep browse routes read-only when capability is absent.
- Ensure submitted orders are immutable and auditable.
- Ensure owner order mutations are branch-authorized.
- Keep deferred features hidden behind flags.

**Non-Goals:**
- Full marketplace rollout for pickup/order-ahead in this change.
- Advanced search intelligence beyond locked v1 contract.
- Reintroducing saved/reviews in v1 UI.

## Decisions

1. **Capability-first ordering gate**
   - Introduce a dedicated table capability token/session artifact.
   - Rationale: backend-enforced permission is safer than UI-only controls.
   - Alternative considered: branch-level gating only (`isOrderingEnabled`) — rejected due insufficient granularity.

2. **QR scan must bootstrap capability**
   - QR payload resolves to table context, then exchanges for short-lived capability.
   - Rationale: ties order permission to physical in-store context.
   - Alternative considered: slug-only navigation — rejected for abuse/ambiguity.

3. **Immutable submitted order policy**
   - Submitted order lines cannot be edited; amendments are new order records linked by session.
   - Rationale: ledger-like operational integrity for kitchen and accounting.

4. **Owner mutation authorization at service boundary**
   - All owner order actions verify user ownership of target branch/restaurant.
   - Rationale: prevent cross-branch action risks.

5. **Feature-flag controlled deferrals**
   - Saved/reviews and any deferred UI pathways remain off by explicit flags.
   - Rationale: avoid accidental re-surfacing during iterative development.


6. **Owner operations control plane contract**
   - Define explicit owner-side behavior for branch intake pause/resume, table service lifecycle, and auto-accept semantics.
   - Rationale: owner UI toggles must map to deterministic backend behavior and QA-verifiable outcomes.
   - Alternative considered: leave owner behavior implicit in UI settings — rejected due implementation drift.


## Feature Flag Matrix (All Capabilities)

| Flag | Default (Prod) | Scope | Purpose |
|------|----------------|-------|---------|
| `ff.trackA.tableSessionCapability` | `true` | API + domain | Enforce table-session capability validation for dine-in submit |
| `ff.trackA.qrTableBootstrap` | `true` | API + client | Enable QR payload exchange into table capability |
| `ff.trackA.orderPermissionGating` | `true` | API + UI | Keep browse read-only unless capability is active |
| `ff.trackA.orderImmutability` | `true` | domain | Enforce immutable submitted orders + append-only add-ons |
| `ff.trackA.ownerOrderAuthorization` | `true` | API + domain | Enforce owner-to-branch authorization on order mutations |
| `ff.trackA.ownerOpsControlPlane` | `true` | owner UI + API | Enable owner intake controls + table open/close lifecycle |
| `ff.deferred.savedRestaurants` | `false` | UI + API | Keep Saved Restaurants off in v1 |
| `ff.deferred.reviews` | `false` | UI + API | Keep Reviews off in v1 |
| `ff.deferred.foodModeSearch` | `false` | UI + API | Keep non-v1 search modes off |

Notes:
- Emergency rollback should be possible per-flag without redeploy.
- If any Track A capability flag is disabled, system must fail safe (no unintended order submission path).

## Risks / Trade-offs

- **Risk:** Capability/session model adds complexity in auth/session handling.  
  **Mitigation:** Keep initial capability scope minimal (issue + validate + expire).
- **Risk:** Guest-ordering support may conflict with existing protected procedures.  
  **Mitigation:** Add dedicated capability-auth route while preserving existing authenticated routes.
- **Risk:** Narrow v1 flow may reduce immediate product breadth.  
  **Mitigation:** keep extensible order context enum and flags for future rollout.
- **Risk:** Owner controls may appear wired in UI but remain non-deterministic in backend.  
  **Mitigation:** define owner-ops capability spec + branch-scoped integration tests.

## Migration Plan

1. Add capability data model + validation middleware.
2. Update QR ingestion and bootstrap endpoint.
3. Gate UI and API order actions on capability.
4. Wire checkout to real `order.create` path.
5. Add owner authorization guards.
6. Apply feature flags for deferred modules.
7. Implement owner operations contract (branch intake controls, auto-accept semantics, branch-scoped dashboards).
8. Update tests + QA checklist to Track A acceptance gates.

Rollback: disable capability enforcement via emergency flag while preserving branch-level ordering stop switch.

## Open Questions

- Guest vs authenticated default for dine-in table flow (product/legal decision).
- Capability TTL duration and refresh rules for long dine-in sessions.
- Whether payment-proof submission is mandatory for Track A release candidate or next cut.
