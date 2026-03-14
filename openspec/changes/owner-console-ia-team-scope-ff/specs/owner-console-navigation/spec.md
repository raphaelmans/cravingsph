# Spec: Owner Console Navigation

## Goal

Make the owner console navigation manageable for users with many restaurants and branches by organizing navigation around tasks rather than a deeply nested location tree.

## Requirements

### Requirement: Task-oriented owner sidebar
The system SHALL provide a task-oriented owner sidebar.

#### Scenario: Owner opens owner console
- Given an owner with one or more restaurants
- When they view the owner console
- Then the sidebar presents stable top-level task groups such as Overview, Restaurants, Branch Operations, Team Access, and Account
- And the sidebar does not require expanding the full restaurant→branch hierarchy to perform common tasks

### Requirement: Stable navigation structure
The system SHALL keep the owner sidebar stable as more restaurants and branches are added.

#### Scenario: Owner has many branches
- Given an owner manages many branches
- When more branches are added
- Then the sidebar remains scannable
- And most branch discovery occurs in list/detail pages or switchers rather than an ever-growing nested sidebar tree

### Requirement: Branch shortcut destination
The system SHALL allow owner console branch shortcuts to land in readable branch operational routes.

#### Scenario: Owner jumps into branch operations
- Given an owner is in the owner console
- When they choose a branch operational shortcut
- Then the shortcut may route to `/branch/:slug`
- And the destination reflects the selected branch context
