# US-CUSTOMER-002: Reorder From Past Orders

**As a** customer,
**I want** to reorder a previous order,
**So that** I can quickly add the same items to my cart again.

## Acceptance Criteria

- **Given** a past order contains items that are still available, **When** I tap Reorder, **Then** those items are added back into my active cart for the correct branch.
- **Given** some items are no longer available or have changed, **When** I reorder, **Then** the app only adds valid items and clearly tells me what could not be restored.
