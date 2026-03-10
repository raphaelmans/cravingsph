## ADDED Requirements

### Requirement: Capability-level feature flags for all Track A specs
The system MUST define explicit runtime flags for each Track A capability so rollout, rollback, and QA scope are controlled without code changes.

#### Scenario: Capability flags are configured
- **WHEN** the application boots in any environment
- **THEN** the following flags are resolved with explicit values:
  - `ff.trackA.tableSessionCapability`
  - `ff.trackA.qrTableBootstrap`
  - `ff.trackA.orderPermissionGating`
  - `ff.trackA.orderImmutability`
  - `ff.trackA.ownerOrderAuthorization`
  - `ff.trackA.ownerOpsControlPlane`

#### Scenario: Capability disabled by flag
- **WHEN** any capability flag is set to disabled
- **THEN** the corresponding behavior is not exposed or executed and fail-safe behavior is applied

### Requirement: Deferred feature flag control
The system MUST keep deferred v1 features hidden by explicit feature flags.

#### Scenario: Deferred flags disabled
- **WHEN** deferred flags are disabled in v1
- **THEN** saved-restaurants, reviews, and non-v1 search modes are hidden from user navigation and entry points

#### Scenario: Deferred flags enabled in future phase
- **WHEN** product re-enables deferred features via flags
- **THEN** the system exposes these features without changing core Track A gating behavior

### Requirement: Environment defaults and rollout safety
The system MUST provide environment-specific defaults and emergency kill-switch behavior for all Track A and deferred flags.

#### Scenario: Production defaults
- **WHEN** environment is production
- **THEN** Track A capability flags are enabled and deferred flags are disabled by default

#### Scenario: Emergency rollback
- **WHEN** an operational issue requires immediate mitigation
- **THEN** operators can disable affected capability flags without redeploying and core browse safety behavior remains intact

### Requirement: QA flag matrix traceability
The system MUST maintain a testable mapping from each user journey to the controlling flags.

#### Scenario: QA executes validation suite
- **WHEN** QA validates Track A flows
- **THEN** each pass/fail result can be traced to explicit flag states and configuration snapshot
