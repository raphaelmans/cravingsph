# Spec: Branch Portal Routing

## Goal

Provide short, shareable, branch-specific URLs for staff operations.

## Requirements

### Requirement: Readable branch portal route
The system SHALL provide a readable branch portal route shape for branch-specific operations.

#### Scenario: Branch portal URL is shared with staff
- Given an owner wants to onboard branch staff
- When the owner shares the branch portal URL
- Then the URL is human-readable and practical to share
- And it resolves to the correct branch workspace

#### Scenario: Branch portal uses readable slug format
- Given a branch portal URL is generated
- When the system creates the slug
- Then the route shape is `/branch/:slug`
- And the slug uses `<restaurant-name>-<branch-name-or-location>` as the default readable format

### Requirement: Smart post-login branch landing
The system SHALL support landing users in the most relevant branch workspace after login.

#### Scenario: User has one branch
- Given a user has access to exactly one branch
- When they log in
- Then the system may land them directly in that branch portal

#### Scenario: User has multiple branches
- Given a user has access to multiple branches
- When they log in
- Then the system presents a branch picker or branch-aware landing page

### Requirement: Readable collision handling
The system SHALL preserve readable slugs when resolving collisions.

#### Scenario: Slug collision occurs
- Given two branches would generate the same slug
- When the system resolves the collision
- Then it uses the smallest readable suffix necessary
- And it avoids exposing internal IDs in the primary branch portal URL unless absolutely required

### Requirement: Feature-flag rollout
The system SHALL allow branch portal routing to be enabled incrementally.

#### Scenario: Feature flag disabled
- Given `ff.branch_portal_short_routes` is disabled
- When a branch portal route is requested
- Then the system may fall back to existing owner console navigation or keep the route unavailable
