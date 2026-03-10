# US-00-02: Owner generates table QR assets

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner**, I want to **generate QR assets per table** so that **guests can enter the correct table context for ordering**.

---

## Acceptance Criteria

### Generate table QR code

- Given I am in branch settings
- When I create/select a table and generate QR
- Then the system produces a scannable asset bound to branch + table context

### Download/print QR asset

- Given a table QR asset exists
- When I choose download or print
- Then I receive a usable QR output for on-site deployment

### Table identity is explicit

- Given multiple tables exist
- When I view QR management
- Then each QR asset is clearly labeled by table identity

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duplicate table label | System enforces uniqueness or prompts for correction |
| QR generation fails | System shows recoverable error and retry action |
| Branch inactive | QR creation is blocked with reason |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| tableLabel | text | Yes |
| tableCode | text | Yes |

---

## References

- OpenSpec: `qr-table-bootstrap`, `owner-ops-control-plane`
