# US-OWNER-004: Confirm Or Reject Payment

**As a** restaurant owner,
**I want** to confirm or reject payment per order,
**So that** I keep control over payment verification.

## Acceptance Criteria

- **Given** payment proof has been submitted, **When** I confirm payment, **Then** the order is marked paid and can continue in the fulfillment workflow.
- **Given** payment proof is invalid, **When** I reject it, **Then** the order stays unpaid and the rejection outcome is recorded for follow-up.
