# US-CUSTOMER-003: See Required And Optional Labels

**As a** customer,
**I want** to see which modifier groups are required versus optional,
**So that** I know what I must choose before adding the item.

## Acceptance Criteria

- **Given** an item has multiple modifier groups, **When** I view the customization UI, **Then** each group is labeled as Required or Optional based on configuration.
- **Given** a required group has not been satisfied, **When** I try to add the item to cart, **Then** the UI prevents submission and points me to the missing required selection.
