# US-CUSTOMER-005: Set Item Quantity Before Adding

**As a** customer,
**I want** to choose quantity before adding an item to cart,
**So that** I can order multiple servings in one step.

## Acceptance Criteria

- **Given** I am customizing an item, **When** I increase or decrease quantity, **Then** the draft quantity updates without affecting other cart items.
- **Given** quantity would drop below one, **When** I decrement it, **Then** the control stops at one and does not allow zero or negative quantities.
