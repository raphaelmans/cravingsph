# US-CUSTOMER-001: Add Items To Cart

**As a** customer,
**I want** to add customized items to a running cart,
**So that** I can build my full order before submitting.

## Acceptance Criteria

- **Given** an item customization is valid, **When** I add it to cart, **Then** the cart stores the item with its variant, modifiers, quantity, and totals.
- **Given** the customization is invalid, **When** I attempt to add the item, **Then** the cart is not changed and the missing requirement is shown.
