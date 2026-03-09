# US-CUSTOMER-005: Choose Cash At Counter

**As a** customer,
**I want** to pay with cash at the counter for dine-in orders,
**So that** I can order even if I do not use a digital wallet.

## Acceptance Criteria

- **Given** a branch allows cash for dine-in, **When** I choose the cash-at-counter option, **Then** my order is created without requiring digital payment proof.
- **Given** I am placing a pickup order or the branch does not allow cash, **When** I reach payment, **Then** the cash-at-counter option is hidden or disabled.
