## ADDED Requirements

### Requirement: Dine-in ordering capability
The system MUST require a valid active table-session capability before accepting dine-in order submissions.

#### Scenario: Dine-in order accepted with valid capability
- **WHEN** a customer submits a dine-in order with an active capability bound to the target branch/table
- **THEN** the system accepts the order and records capability/session linkage

#### Scenario: Dine-in order rejected without capability
- **WHEN** a customer submits a dine-in order without a valid capability
- **THEN** the system rejects the request with a permission error
