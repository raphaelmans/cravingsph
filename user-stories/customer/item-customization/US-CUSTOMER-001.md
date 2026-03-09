# US-CUSTOMER-001: Choose Item Variant

**As a** customer,
**I want** to select a size or variant for an item,
**So that** I can pick the option that fits my order.

## Acceptance Criteria

- **Given** an item has configured variants, **When** I select a variant, **Then** the active variant and its price are reflected in the customization state.
- **Given** an item has no variants, **When** I open customization, **Then** the item uses its base price and no variant picker is required.
