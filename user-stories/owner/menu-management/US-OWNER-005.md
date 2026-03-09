# US-OWNER-005: Add Priced Modifiers

**As a** restaurant owner,
**I want** to add modifiers inside a modifier group,
**So that** customers can choose paid or free add-ons.

## Acceptance Criteria

- **Given** a modifier group exists, **When** I add a modifier with a name and optional price, **Then** that modifier is saved under the selected group.
- **Given** I omit price for a free modifier, **When** I save it, **Then** the stored modifier defaults to zero additional cost.
