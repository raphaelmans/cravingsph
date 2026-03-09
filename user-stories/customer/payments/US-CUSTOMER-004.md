# US-CUSTOMER-004: See Payment Countdown

**As a** customer,
**I want** to see how long I have to complete payment,
**So that** I understand the payment deadline for my order.

## Acceptance Criteria

- **Given** a branch has a configured payment countdown, **When** my order enters the payment step, **Then** I see the remaining payment time based on that branch setting.
- **Given** the countdown expires before valid payment proof is accepted, **When** expiration is processed, **Then** the order is marked expired and cannot continue as payable.
