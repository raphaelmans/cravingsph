# US-01-04: Submitted orders are immutable and add-ons become new orders

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **restaurant operator and customer**, I want **submitted orders to be immutable** so that **kitchen execution and business ledger integrity remain reliable**.

---

## Acceptance Criteria

### Immutable submit behavior

- Given an order is already submitted
- When customer or owner attempts line-item mutation
- Then system rejects content mutation request

### Add-on order behavior

- Given customer wants additional items after submit
- When they place another request
- Then system creates a new linked order record

### Timeline integrity

- Given status/payment actions occur
- When timeline is viewed
- Then history appears append-only with actor + timestamp metadata

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Owner tries quick edit instead of new order | System blocks and suggests correct add-on flow |
| Partial failure while creating add-on order | Original order remains unchanged |
| Dispute review | Timeline shows all transitions without destructive edits |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| parentOrderId | text | No |
| orderItems | list | Yes |

---

## References

- OpenSpec: `order-ledger-immutability`
