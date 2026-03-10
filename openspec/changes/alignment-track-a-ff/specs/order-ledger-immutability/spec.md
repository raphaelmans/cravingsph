## ADDED Requirements

### Requirement: Submitted order immutability
The system MUST prevent mutation of submitted order line-items and totals.

#### Scenario: Attempt to modify submitted order
- **WHEN** any actor attempts to edit submitted order contents
- **THEN** the system rejects the modification request

#### Scenario: Additional demand after submission
- **WHEN** customers need to add items after submit
- **THEN** the system creates a new order record linked to the same service context

### Requirement: Append-only audit trail
The system MUST keep append-only status and payment decision history for each order.

#### Scenario: Status update
- **WHEN** order status changes
- **THEN** the system appends a timeline record with actor and timestamp
