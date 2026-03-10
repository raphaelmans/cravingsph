# US-01-03: Customer places dine-in order with valid capability

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **dine-in customer**, I want to **submit my order once I have valid capability** so that **kitchen receives my ticket reliably**.

---

## Acceptance Criteria

### Successful submit under valid context

- Given branch intake is live and my capability is valid
- When I submit cart
- Then order is created successfully with real order number

### Branch/table linkage preserved

- Given order is created
- When owner views order details
- Then branch and table context are correctly associated

### Rejection when preconditions fail

- Given capability is invalid or branch intake is paused
- When I submit
- Then system rejects submission with clear reason

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Capability expires during checkout | Submit fails gracefully and prompts re-scan |
| Duplicate submit tap | System handles idempotently and avoids duplicate tickets |
| Network timeout after submit | Customer can safely retry/check order status |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| orderType | select | Yes |
| items | list | Yes |
| specialInstructions | text | No |

---

## References

- OpenSpec: `table-session-capability`, `order-permission-gating`
