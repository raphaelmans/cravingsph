# US-CUSTOMER-008: Receive Push Notifications For Status Changes

**As a** customer,
**I want** to receive push notifications when my order status changes,
**So that** I do not have to keep checking the app.

## Acceptance Criteria

- **Given** I have granted notification permission, **When** my order status changes, **Then** a push notification is sent with the updated status.
- **Given** I have not granted notification permission, **When** the order status changes, **Then** the in-app order screen still reflects the updated status without failing the workflow.
