# US-00-05: Owner configures deterministic auto-accept policy

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner**, I want to **toggle auto-accept per branch** so that **order intake behavior is predictable and aligned with staffing model**.

---

## Acceptance Criteria

### Auto-accept OFF behavior

- Given auto-accept is disabled
- When a new eligible order arrives
- Then order stays in inbox/new state awaiting manual action

### Auto-accept ON behavior

- Given auto-accept is enabled
- When a new eligible order arrives
- Then system applies defined status transition automatically and records timeline metadata

### Behavior is transparent

- Given owner changes auto-accept setting
- When viewing branch settings/orders
- Then current mode is clearly visible

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Toggle changed during order burst | Each order follows policy active at ingestion time |
| Auto-accept with invalid branch state | Order remains blocked per intake/session rules |
| Timeline missing actor context | System records system actor metadata for automatic actions |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| autoAcceptOrders | boolean | Yes |

---

## References

- OpenSpec: `owner-ops-control-plane`
