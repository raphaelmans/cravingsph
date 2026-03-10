## ADDED Requirements

### Requirement: Owner branch authorization for order mutations
The system MUST verify that the acting owner/admin is authorized for the order's branch before accepting order mutations.

#### Scenario: Authorized owner action
- **WHEN** an owner assigned to the branch accepts/rejects/updates an order
- **THEN** the system performs the mutation and logs the actor

#### Scenario: Unauthorized owner action
- **WHEN** an owner outside branch scope attempts an order mutation
- **THEN** the system rejects the request with a forbidden error
