# US-OWNER-003: Define Item Variants

**As a** restaurant owner,
**I want** to configure variants such as size options for a menu item,
**So that** customers can choose among structured item options.

## Acceptance Criteria

- **Given** a menu item exists, **When** I add one or more variants with names and prices, **Then** those variants are stored against that menu item.
- **Given** variant input is invalid, **When** I save it, **Then** the system does not create the variant and shows a validation error.
