# US-CUSTOMER-003: Search Menu Items

**As a** customer,
**I want** to search menu items by name within a restaurant,
**So that** I can jump to a specific item.

## Acceptance Criteria

- **Given** a branch menu is loaded, **When** I enter a search term, **Then** the results only include matching items from that branch.
- **Given** no items match my search, **When** the search completes, **Then** I see an empty-state message and the rest of the menu is not modified until I clear the query.
