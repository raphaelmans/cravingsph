# US-CUSTOMER-002: Place Pickup Order As Guest

**As a** customer,
**I want** to place a pickup order with my name and phone number,
**So that** the restaurant can contact me when my order is ready.

## Acceptance Criteria

- **Given** I choose pickup, **When** I enter my name and phone number and submit, **Then** the order is created with those guest contact details.
- **Given** pickup contact details are incomplete or invalid, **When** I try to continue, **Then** the checkout form shows validation errors and does not submit.
