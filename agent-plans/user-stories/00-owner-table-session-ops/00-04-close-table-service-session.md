# US-00-04: Owner closes table service session

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner/staff**, I want to **close a table service session** so that **no further orders can be submitted for that completed dining cycle**.

---

## Acceptance Criteria

### Close active session

- Given table T has an active session
- When I close session for table T
- Then the session becomes closed and new capability issuance is blocked

### Existing stale checkout attempts are blocked

- Given a customer keeps a previously open checkout screen
- When they submit after table session is closed
- Then submission is rejected with session-closed message

### Closure is auditable

- Given session is closed
- When I inspect logs/history
- Then closure actor and timestamp are recorded

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Close request on already closed table | System returns idempotent success or explicit no-op |
| Network interruption during close | Final state is consistent and visible on refresh |
| Closing with pending prep orders | Existing orders continue lifecycle; only new submits are blocked |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| tableId | text | Yes |
| closeReason | text | No |

---

## References

- OpenSpec: `owner-ops-control-plane`, `order-permission-gating`
