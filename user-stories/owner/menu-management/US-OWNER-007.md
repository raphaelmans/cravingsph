# US-OWNER-007: Mark Items Sold Out

**As a** restaurant owner,
**I want** to temporarily mark an item as sold out,
**So that** customers cannot order unavailable items.

## Acceptance Criteria

- **Given** a menu item exists, **When** I mark it unavailable, **Then** it is hidden or blocked from the public orderable menu.
- **Given** the item becomes available again, **When** I re-enable it, **Then** it returns to the customer-facing menu without recreating the item.
