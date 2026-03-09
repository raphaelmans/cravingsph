# US-OWNER-001: Invite Team Members

**As a** restaurant owner,
**I want** to invite team members by email,
**So that** staff can help manage restaurant operations.

## Acceptance Criteria

- **Given** I am an owner, **When** I send an invitation to a valid email address, **Then** the invited user is added to the restaurant access workflow with a pending invite state.
- **Given** the email is invalid or already has conflicting access, **When** I submit the invite, **Then** the system rejects it with a clear validation message.
