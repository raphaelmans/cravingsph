# US-01-02: Customer can browse menu in read-only mode without capability

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **visitor**, I want to **browse menus without being blocked** so that **I can explore options before I scan QR at the table**.

---

## Acceptance Criteria

### Read-only browse allowed

- Given I open restaurant page without capability
- When page loads
- Then menu content is visible in browse-only mode

### Order actions blocked

- Given I am in browse-only mode
- When I try to place an order
- Then system blocks submit and explains how to unlock ordering

### Upgrade path is clear

- Given ordering is blocked in browse mode
- When I view the page
- Then I see clear guidance to scan valid table QR

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Stale capability in local state | Server-side validation decides final permission |
| Deep link to checkout route without capability | Route redirects/blocks with explanatory state |
| Branch intake paused | Browse still works while submit remains blocked |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| mode | select | Yes |

---

## References

- OpenSpec: `order-permission-gating`
