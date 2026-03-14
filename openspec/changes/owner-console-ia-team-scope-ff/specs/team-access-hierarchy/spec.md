# Spec: Team Access Hierarchy

## Goal

Define a team-access hierarchy that matches the real platform structure while keeping the owner-facing access model easy to understand.

## Requirements

### Requirement: Detailed internal hierarchy
The system SHALL preserve the internal business hierarchy needed by the platform.

#### Scenario: Internal entities remain structured
- Given the platform data model
- When hierarchy is evaluated internally
- Then the platform can represent `Platform -> Organization -> Restaurant -> Branch`

### Requirement: Simplified user-facing RBAC hierarchy
The system SHALL present a simplified user-facing RBAC hierarchy for initial team access.

#### Scenario: Owner manages team access
- Given an owner is assigning access
- When they use Team Access
- Then the primary scopes they see are `Business` and `Branch`
- And they are not required to reason about separate organization and restaurant levels for common staff assignments

### Requirement: Platform remains separate from business access
The system SHALL keep platform administration separate from business and branch operational access.

#### Scenario: Platform admin access is evaluated
- Given a user has platform administration access
- When authorization is checked
- Then the platform role is evaluated separately from business and branch assignments

### Requirement: Business scope aggregates higher-level management
The system SHALL treat business scope as the combined owner-facing management layer above branch operations.

#### Scenario: Business-scoped user operates across branches
- Given a team member has a business-scoped assignment
- When they manage operational resources across multiple restaurants and branches under that business
- Then the system permits access according to their role template within that business

### Requirement: Branch scope isolates daily operations
The system SHALL allow branch-scoped access for users limited to one physical location.

#### Scenario: Branch staff only manages one branch
- Given a staff member is assigned to one branch
- When they access the product
- Then they can operate only within that branch scope
- And they cannot access unrelated branches or broader business settings
