# US-OWNER-006: Reorder Categories And Items

**As a** restaurant owner,
**I want** to reorder categories and menu items,
**So that** I control how the menu appears to customers.

## Acceptance Criteria

- **Given** a branch has multiple categories or items, **When** I reorder them, **Then** the new sort order is persisted and reflected in future menu reads.
- **Given** reorder input does not contain the expected full set of entities, **When** the update is submitted, **Then** the system rejects the invalid reorder payload.
