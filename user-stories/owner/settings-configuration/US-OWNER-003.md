# US-OWNER-003: Set Payment Countdown Duration

**As a** restaurant owner,
**I want** to configure how long customers have to pay,
**So that** I can control unpaid order expiration windows.

## Acceptance Criteria

- **Given** I am editing branch payment settings, **When** I set a valid countdown duration, **Then** new orders for that branch use that payment deadline.
- **Given** the countdown value is invalid, **When** I try to save it, **Then** the system rejects the update until a valid duration is provided.
