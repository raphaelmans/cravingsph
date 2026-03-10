## ADDED Requirements

### Requirement: Branch order intake control
The system MUST allow authorized owners to control branch order intake state for Track A operations.

#### Scenario: Owner pauses intake
- **WHEN** an authorized owner disables branch order intake
- **THEN** new order submissions for that branch are rejected while browse routes remain accessible

#### Scenario: Owner resumes intake
- **WHEN** an authorized owner re-enables branch order intake
- **THEN** eligible submissions are accepted according to active capability and policy rules

### Requirement: Table-session lifecycle controls for operations
The system MUST support owner-operated lifecycle controls for table service context.

#### Scenario: Open table service context
- **WHEN** an authorized owner/staff opens a table service context
- **THEN** customers scanning the table QR can obtain valid order capability for that context

#### Scenario: Close table service context
- **WHEN** an authorized owner/staff closes a table service context
- **THEN** no new capabilities are issued and existing submissions tied to closed context are rejected

### Requirement: Deterministic auto-accept behavior
The system MUST implement deterministic auto-accept behavior at branch level.

#### Scenario: Auto-accept enabled
- **WHEN** branch auto-accept is enabled and an eligible order is created
- **THEN** the system transitions order status according to policy and writes timeline entries with system actor metadata

#### Scenario: Auto-accept disabled
- **WHEN** branch auto-accept is disabled
- **THEN** new eligible orders remain in inbox state pending owner action

### Requirement: Owner dashboard branch-scoped truth
The owner order dashboard MUST display branch-scoped records only.

#### Scenario: Branch has no orders
- **WHEN** no orders exist for the selected branch
- **THEN** the dashboard shows empty state and no seeded/shared fallback records

#### Scenario: Cross-branch access attempt
- **WHEN** an owner accesses a branch outside their authorized scope
- **THEN** the system denies access to branch order records
