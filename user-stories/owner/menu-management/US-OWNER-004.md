# US-OWNER-004: Create Modifier Groups

**As a** restaurant owner,
**I want** to create modifier groups with selection rules,
**So that** item customization is structured and enforceable.

## Acceptance Criteria

- **Given** a menu item exists, **When** I create a modifier group with required status and min or max selections, **Then** the group is saved with those rules.
- **Given** the max selections would be lower than the minimum, **When** I save the modifier group, **Then** the change is rejected as invalid.
