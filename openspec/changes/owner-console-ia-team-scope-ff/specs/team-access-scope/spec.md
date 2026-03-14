# Spec: Team Access and Scope

## Goal

Support access assignment based on both role template and scope so owners can grant the right level of access to the right people without exposing unnecessary hierarchy complexity.

## Requirements

### Requirement: Role template and scope are separate concepts
The system SHALL model role template and scope independently.

#### Scenario: User receives scoped access
- Given an owner assigns access to a team member
- When the assignment is created
- Then the assignment includes both a role template and a scope
- And the user-facing scope model for v1 may be `business` or `branch`

### Requirement: Membership plus scoped assignments
The system SHALL support a membership layer plus scoped access assignments.

#### Scenario: User belongs to the business ecosystem
- Given a user is part of the business ecosystem
- When their access is evaluated
- Then the system can determine they belong to the business
- And the system can evaluate one or more scoped assignments for operational access

### Requirement: Team access surface in owner console
The system SHALL provide a Team Access surface in the owner console.

#### Scenario: Owner manages team access
- Given an owner wants to manage staff permissions
- When they open Team Access
- Then they can review members, invites, and assigned scopes

### Requirement: Role-template-first UX
The system SHALL prefer role templates over a permission-checkbox-first UX in the initial rollout.

#### Scenario: Owner invites a branch staff user
- Given an owner wants to invite branch staff
- When they create the invite
- Then they can select a role template and a target scope
- And they are not required to manually configure a large permission matrix

### Requirement: Scoped authorization
The system SHALL restrict relevant routes and operations according to the assigned scope.

#### Scenario: Branch-scoped staff attempts out-of-scope access
- Given a team member is assigned only to Branch A
- When they attempt to access Business B or Branch C operations
- Then the system denies access

#### Scenario: Business-wide manager accesses multiple branches
- Given a team member has business scope
- When they navigate between restaurants and branches within that business
- Then the system permits the authorized operations for their role across the assigned scope
