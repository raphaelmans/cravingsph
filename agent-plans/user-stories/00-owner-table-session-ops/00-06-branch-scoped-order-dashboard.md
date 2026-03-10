# US-00-06: Owner views branch-scoped order dashboard

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As an **owner**, I want to **see only orders for the selected branch** so that **operations are accurate and not polluted by seeded/shared data**.

---

## Acceptance Criteria

### Branch-scoped listing

- Given I open branch A orders
- When orders are loaded
- Then only branch A orders are displayed

### Empty state for no orders

- Given selected branch has no orders
- When dashboard loads
- Then clear empty state is shown (no fallback records)

### Detail view remains branch-safe

- Given I open order detail from branch A dashboard
- When detail loads
- Then order context matches branch A scope

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Query returns mixed-branch rows | System filters to selected branch scope before render |
| Seeded fallback exists in code path | Dashboard still shows strict empty state when no branch orders |
| Stale cache after branch switch | Cache invalidates and reloads selected branch truth |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| branchId | text | Yes |
| statusFilter | select | No |

---

## References

- OpenSpec: `owner-ops-control-plane`, `owner-order-authorization`
- Gap issue: `issues/alignment-track-a/` dashboard fallback concerns
