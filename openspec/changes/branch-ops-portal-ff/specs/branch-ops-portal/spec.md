# Spec: Branch Ops Portal

## Goal

Provide a branch-scoped workspace for daily operations so branch staff and owners can manage one branch without navigating deep owner console hierarchies.

## Requirements

### Requirement: Branch portal workspace
The system SHALL provide a branch-scoped operations workspace for a single branch.

#### Scenario: Branch user enters branch portal
- Given a user has access to a branch
- When they open the branch portal URL
- Then they land in a workspace scoped to that branch
- And the primary navigation is limited to branch operations

#### Scenario: Branch portal focuses on daily execution
- Given a branch portal user
- When they use the branch portal
- Then the portal emphasizes daily tasks such as orders, tables, menu, and branch settings
- And it does not require repeated navigation through organization and restaurant hierarchy

### Requirement: Owner console remains available
The system SHALL keep the owner org console as the top-level multi-restaurant management surface.

#### Scenario: Owner needs cross-branch management
- Given an owner with multiple branches
- When they need higher-level management
- Then they can still access the organization console
- And the branch portal does not replace owner-wide controls
