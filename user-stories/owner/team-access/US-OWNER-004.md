# US-OWNER-004: Restrict Viewers To Read-Only Access

**As a** restaurant owner,
**I want** viewers to have read-only access to order information,
**So that** front-of-house staff can check status without changing operations.

## Acceptance Criteria

- **Given** a team member has the viewer role, **When** they access orders, **Then** they can read order details but cannot accept, reject, or update orders.
- **Given** a viewer attempts a write action, **When** authorization runs, **Then** the request is blocked.
