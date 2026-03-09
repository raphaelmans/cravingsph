# US-CUSTOMER-004: Enforce Selection Rules

**As a** customer,
**I want** modifier groups to enforce minimum and maximum selections,
**So that** the restaurant's customization rules are respected.

## Acceptance Criteria

- **Given** a modifier group has min and max limits, **When** I select modifiers, **Then** the UI enforces those limits and shows the allowed range.
- **Given** I attempt to exceed the maximum or submit below the minimum, **When** validation runs, **Then** the item cannot be added until the selection is valid.
