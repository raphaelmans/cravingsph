## Why

Alignment decisions now require a strict Track A (table-first) execution contract, but the current implementation still mixes broader platform behavior with incomplete gating. This causes QA ambiguity, owner-ops risk, and inconsistent customer ordering paths.

## What Changes

- Enforce a table-session capability model for dine-in order permission.
- Make QR scan bootstrap table ordering capability, not just restaurant navigation.
- Gate ordering actions so browse-only traffic is read-only.
- Wire customer checkout to real order creation and remove stub submit path.
- Preserve submitted-order immutability as ledger behavior.
- Add explicit owner authorization checks for order mutations.
- Add a complete feature-flag matrix across all Track A capabilities, and keep deferred v1 features hidden.
- Lock and document v1 search contract.

## Capabilities

### New Capabilities

- `table-session-capability`: model and validate active dine-in order capability.
- `qr-table-bootstrap`: QR payload and exchange flow that establishes order capability.
- `order-permission-gating`: read-only browse mode unless valid order capability exists.
- `order-ledger-immutability`: enforce immutable submitted orders and append-only corrections.
- `owner-order-authorization`: branch ownership checks for owner order mutations.
- `owner-ops-control-plane`: owner-facing operations contract for branch intake controls, table session lifecycle, and auto-accept behavior.
- `v1-feature-flags`: define full capability/deferred flag matrix with safe defaults and rollback controls.
- `v1-search-contract`: lock search mode and filters for this release.

### Modified Capabilities

- None (OpenSpec baseline specs are not yet established in this repository).

## Impact

- Affected modules: `order`, `discovery`, `branch`, `payment`, owner order management UI, branch settings/operations UI, public restaurant/menu flow.
- API impact: new/updated endpoints for capability bootstrap and order submission gating.
- Data impact: table-session capability artifacts and authorization checks on owner mutations.
- QA impact: narrower v1 test matrix and deterministic acceptance criteria.
