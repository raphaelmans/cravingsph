# US-01-01: Customer obtains ordering capability via table QR

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **dine-in customer**, I want to **scan table QR to start ordering** so that **the app knows I’m physically at a valid table context**.

---

## Acceptance Criteria

### Valid QR grants capability

- Given table session is active
- When I scan a valid table QR
- Then system grants/resumes ordering capability for that table context

### Invalid QR is rejected safely

- Given QR payload is invalid/expired
- When I scan it
- Then system does not grant capability and shows recoverable error

### Capability is scoped

- Given I got capability from table T
- When I proceed to order
- Then submit is scoped to that table/branch context

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Camera denied | UI provides retry/instructions and alternative route |
| Re-scan same table quickly | Existing active capability is reused or refreshed idempotently |
| QR from different branch | Capability switches only after explicit successful bootstrap |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| qrPayload | text | Yes |

---

## References

- OpenSpec: `qr-table-bootstrap`, `table-session-capability`
