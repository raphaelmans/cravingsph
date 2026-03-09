# US-CUSTOMER-007: Track Real-Time Order Status

**As a** customer,
**I want** to receive real-time updates for my order status,
**So that** I know when my food is being prepared or ready.

## Acceptance Criteria

- **Given** an order has been placed, **When** the restaurant changes its status, **Then** the customer order view updates to the latest lifecycle state without manual refresh.
- **Given** realtime delivery is temporarily unavailable, **When** I reopen the order status screen, **Then** I still see the latest persisted status from the backend.
