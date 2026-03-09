# US-CUSTOMER-003: Edit Or Remove Cart Items

**As a** customer,
**I want** to change quantities or remove cart lines,
**So that** I can adjust my order before checkout.

## Acceptance Criteria

- **Given** my cart has items, **When** I increase, decrease, or remove a line, **Then** the cart updates immediately and recalculates totals.
- **Given** a line quantity is reduced to zero through cart controls, **When** the update is applied, **Then** that line is removed from the cart.
