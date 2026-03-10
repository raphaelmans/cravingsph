# US-00-03: Owner opens table service session

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner/staff**, I want to **open a table service session** so that **guests at that table can obtain valid ordering capability**.

---

## Acceptance Criteria

### Open session for seated guests

- Given I am authorized for the branch
- When I open session for table T
- Then table T is marked active for ordering capability issuance

### Session metadata is tracked

- Given table session is opened
- When I inspect session details
- Then opened-at and actor information are available

### Session state visible in owner UI

- Given one or more tables are active
- When I view table operations
- Then active/inactive states are visible per table

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Opening already active table | System prevents duplicate active sessions |
| Stale previous session exists | System prompts reopen/replace flow with audit note |
| Unauthorized staff account | Action is denied |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| tableId | text | Yes |
| note | text | No |

---

## References

- OpenSpec: `table-session-capability`, `owner-ops-control-plane`
