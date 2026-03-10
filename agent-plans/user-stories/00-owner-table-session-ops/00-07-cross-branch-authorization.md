# US-00-07: Owner actions are blocked outside authorized branch scope

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **platform admin/product owner**, I want **owner order actions to be branch-authorized** so that **no one can mutate orders outside their assigned scope**.

---

## Acceptance Criteria

### Authorized mutation succeeds

- Given owner is authorized for branch A
- When owner accepts/rejects/updates order in branch A
- Then mutation succeeds and actor is recorded

### Unauthorized mutation denied

- Given owner is not authorized for branch B
- When owner attempts order mutation in branch B
- Then system returns forbidden and no mutation occurs

### Read access aligned with write access

- Given owner has no scope on branch B
- When owner requests list/detail for branch B orders
- Then access is denied

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Direct API call bypass attempt | Service-layer authorization still blocks action |
| Order moved/corrupted branch reference | System fails safe with authorization error |
| Concurrent ownership change | Authorization uses latest persisted ownership |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| orderId | text | Yes |
| action | select | Yes |
| reason | text | No |

---

## References

- OpenSpec: `owner-order-authorization`, `owner-ops-control-plane`
