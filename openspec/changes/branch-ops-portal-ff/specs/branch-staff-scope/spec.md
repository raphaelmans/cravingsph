# Spec: Branch-Scoped Staff Access

## Goal

Ensure staff can be limited to only the branches they are authorized to operate.

## Requirements

### Requirement: Branch membership model
The system SHALL support branch-scoped access assignments for users.

#### Scenario: User belongs to one branch only
- Given a user is assigned to one branch
- When they sign in
- Then the system can determine their branch membership
- And the user can be scoped to that branch only

### Requirement: Branch-scoped authorization
The system SHALL enforce branch-level access restrictions in branch portal routes and operations.

#### Scenario: Staff tries to access another branch
- Given a staff user only has access to Branch A
- When they attempt to access Branch B portal or branch operations
- Then the system denies access

#### Scenario: Staff uses branch portal within scope
- Given a staff user has access to Branch A
- When they open Branch A portal
- Then they can view and perform actions permitted by their branch role

### Requirement: Branch role compatibility
The system SHALL support branch-level roles compatible with daily operations.

#### Scenario: Branch viewer role
- Given a branch viewer
- When they use the branch portal
- Then they can view branch operational state
- And they cannot perform write actions outside their permission set
