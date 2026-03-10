## ADDED Requirements

### Requirement: Browse-only mode without capability
The system MUST expose restaurant browsing in read-only mode when order capability is absent.

#### Scenario: Direct restaurant page without capability
- **WHEN** a user opens a restaurant page without active order capability
- **THEN** the system allows menu browsing but disables order submission actions

#### Scenario: Capability becomes active
- **WHEN** a valid capability is established for the same user context
- **THEN** the system enables order-affecting actions for the scoped table session
