# Spec: Owner Sidebar Workspace Model

## Goal

Introduce a workspace-style sidebar model so owners can switch context cleanly without cluttering the navigation rail.

## Requirements

### Requirement: Workspace switcher
The system SHALL support a workspace/context switcher in the owner sidebar header.

#### Scenario: Owner changes context
- Given an owner has multiple restaurants or branches
- When they use the workspace switcher
- Then they can change context without navigating a deep nested tree

### Requirement: Context-aware shortcuts
The system SHALL allow the sidebar and page shell to show context-aware shortcuts for the selected workspace.

#### Scenario: Owner selects a branch context
- Given a branch context is selected
- When the owner views the console
- Then the app may surface quick links and actions related to that branch
- And the overall sidebar structure remains stable
- And those shortcuts may route to readable branch operations URLs such as `/branch/:slug`
