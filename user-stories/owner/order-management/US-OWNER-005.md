# US-OWNER-005: Update Order Status

**As a** restaurant owner,
**I want** to update order status through the fulfillment lifecycle,
**So that** customers know the progress of their order.

## Acceptance Criteria

- **Given** an order is in an active lifecycle state, **When** I move it to the next valid status, **Then** the new status is stored and exposed to the customer.
- **Given** a requested transition is invalid for the order's current state, **When** I try to apply it, **Then** the status change is rejected.
