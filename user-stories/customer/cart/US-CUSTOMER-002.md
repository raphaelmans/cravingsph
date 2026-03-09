# US-CUSTOMER-002: Merge Identical Cart Lines

**As a** customer,
**I want** identical cart lines to merge automatically,
**So that** my cart stays clean and easy to review.

## Acceptance Criteria

- **Given** I add an item that matches an existing cart line by item, variant, and modifiers, **When** it is added, **Then** the existing line quantity increases instead of creating a duplicate row.
- **Given** any selected modifier or variant differs, **When** I add the item, **Then** the cart creates a separate line item.
