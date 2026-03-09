# US-CUSTOMER-005: Persist Cart Locally

**As a** customer,
**I want** my cart to persist across page refreshes,
**So that** I do not lose my selections if I close the browser by accident.

## Acceptance Criteria

- **Given** I have items in my cart, **When** I refresh the page on the same device and browser, **Then** the cart contents are restored from local storage.
- **Given** stored cart data belongs to a different branch or is invalid, **When** the cart hydrates, **Then** incompatible data is ignored instead of corrupting the active cart.
