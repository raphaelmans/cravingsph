# US-OWNER-003: Accept Or Reject Orders

**As a** restaurant owner,
**I want** to accept or reject incoming orders with an optional reason,
**So that** I keep control over what the restaurant fulfills.

## Acceptance Criteria

- **Given** an order is awaiting review in manual mode, **When** I accept it, **Then** the order moves into the active lifecycle and becomes visible to the customer as accepted.
- **Given** I reject the order, **When** I optionally provide a reason, **Then** the order moves to a rejected or cancelled outcome with that reason recorded for the customer.
