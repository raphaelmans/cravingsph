# US-CUSTOMER-003: Choose Order Type At Checkout

**As a** customer,
**I want** to choose between dine-in and pickup,
**So that** the restaurant knows how to fulfill my order.

## Acceptance Criteria

- **Given** a branch supports more than one order type, **When** I reach checkout, **Then** I can explicitly choose dine-in or pickup before placing the order.
- **Given** I switch order type during checkout, **When** the form updates, **Then** only the fields relevant to the selected order type remain required.
