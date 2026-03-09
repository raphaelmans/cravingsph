# US-CUSTOMER-006: See Order Confirmation

**As a** customer,
**I want** to see a confirmation screen after placing an order,
**So that** I know the order was received and what happens next.

## Acceptance Criteria

- **Given** an order is created successfully, **When** checkout finishes, **Then** I see a confirmation view showing the order ID and next-step guidance.
- **Given** order creation fails, **When** checkout returns an error, **Then** I remain on checkout with the cart preserved and an actionable error message.
