# US-00-01: Owner controls branch order intake state

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner**, I want to **pause or resume order intake per branch** so that **I can control service load without shutting down discovery visibility**.

---

## Acceptance Criteria

### Pause order intake

- Given I am an authorized owner for a branch
- When I turn order intake to paused
- Then new order submissions for that branch are rejected

### Resume order intake

- Given order intake is paused
- When I turn order intake back to live
- Then eligible submissions for that branch are accepted again

### Discovery remains visible

- Given branch order intake is paused
- When a customer opens the branch/restaurant page
- Then browsing remains available but ordering actions follow capability + intake rules

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Owner rapidly toggles pause/live | Latest successful state is authoritative and reflected in UI + API |
| Intake paused mid-checkout | Submit is rejected with clear retry guidance |
| Unauthorized user attempts update | System returns forbidden and no state change |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| isOrderingEnabled | boolean | Yes |

---

## References

- PRD: `docs/prd.md` (owner order operations)
- OpenSpec: `owner-ops-control-plane` + `order-permission-gating`
