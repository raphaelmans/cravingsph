## 1. Capability & QR Foundation

- [ ] 1.1 Add table-session capability model (issue, validate, expire)
- [ ] 1.2 Implement QR bootstrap exchange endpoint for table capability
- [ ] 1.3 Add integration tests for valid/invalid/expired QR payload flows

## 2. API Enforcement

- [ ] 2.1 Gate dine-in order submission on valid table capability
- [ ] 2.2 Add explicit unauthorized/forbidden error mapping for capability failures
- [ ] 2.3 Enforce owner-to-branch authorization on all order mutation paths

## 3. UI Flow Lock (Track A)

- [ ] 3.1 Add read-only browse mode when capability is absent
- [ ] 3.2 Enable checkout controls only when capability is active
- [ ] 3.3 Replace checkout stub path with real `order.create` mutation wiring

## 4. Ledger & Timeline Rules

- [ ] 4.1 Enforce submitted-order immutability in service layer
- [ ] 4.2 Implement add-on order behavior as new linked order record
- [ ] 4.3 Extend timeline coverage for all status/payment decisions

## 5. Feature Flags & Scope Control

- [ ] 5.1 Add v1 flags for deferred features (`saved`, `reviews`, non-v1 search modes)
- [ ] 5.2 Hide deferred routes/components behind runtime flag checks
- [ ] 5.3 Add regression tests to ensure deferred modules remain off in v1 config
- [ ] 5.4 Add capability-level flags for all Track A specs (table session, QR bootstrap, permission gating, immutability, owner auth, owner ops)
- [ ] 5.5 Document env defaults + emergency kill-switch runbook for all flags

## 6. Search Contract Alignment

- [ ] 6.1 Lock and document v1 search contract in API/UI docs
- [ ] 6.2 Update discovery endpoints/UI to match locked contract
- [ ] 6.3 Add QA acceptance cases for approved search behavior


## 7. Owner Operations Contract

- [ ] 7.1 Enforce branch intake pause/resume behavior in order ingestion path
- [ ] 7.2 Implement table service context open/close controls and capability invalidation on close
- [ ] 7.3 Wire `autoAcceptOrders` to deterministic status transitions with timeline metadata
- [ ] 7.4 Ensure order dashboard remains branch-scoped with no seeded/shared fallback paths
- [ ] 7.5 Add authorization + integration tests for owner operations and cross-branch denial
