## ADDED Requirements

### Requirement: Single explicit v1 search contract
The system MUST implement and document a single search contract for this release.

#### Scenario: Restaurant-mode-only v1
- **WHEN** v1 release is locked to restaurant-mode search
- **THEN** API and UI expose only the approved restaurant search/filter behavior

#### Scenario: Deferred search modes
- **WHEN** non-v1 search modes are deferred
- **THEN** those modes remain hidden and non-routable in production configuration
