## ADDED Requirements

### Requirement: QR bootstrap establishes ordering context
The system MUST resolve supported QR payloads into table context and issue an order capability before order-enabled UI is shown.

#### Scenario: Valid table QR
- **WHEN** a customer scans a valid table QR payload
- **THEN** the system issues/resumes an active capability for that table context

#### Scenario: Invalid QR payload
- **WHEN** a customer scans an invalid or expired QR payload
- **THEN** the system does not grant capability and shows a recoverable error
