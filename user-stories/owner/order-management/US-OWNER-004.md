# US-OWNER-004: Enable Auto-Accept Orders

**As a** restaurant owner,
**I want** to configure auto-accept mode for a branch,
**So that** orders can be confirmed instantly without manual review.

## Acceptance Criteria

- **Given** auto-accept is enabled for a branch, **When** a new order is created, **Then** the order skips manual acceptance and enters the preparing flow automatically.
- **Given** auto-accept is disabled, **When** a new order is created, **Then** it remains in the inbox until an authorized operator accepts or rejects it.
