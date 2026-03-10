# Alignment Track A Audit (Table-First v1)

This set captures implementation misalignments against the locked direction from alignment thread #1:

- Track A first (table-first dine-in)
- submitted orders are immutable (ledger behavior)
- v1 UI remains narrow
- architecture remains extensible for future flows

## Files

- `000-implementation-overview.md`
- `001-no-table-session-capability-model-or-gating.md`
- `002-qr-scan-does-not-bootstrap-table-ordering-context.md`
- `003-restaurant-page-allows-checkout-without-order-capability.md`
- `004-customer-checkout-is-stubbed-and-not-calling-order-create.md`
- `005-order-create-requires-auth-blocking-guest-table-flow.md`
- `006-owner-order-actions-lack-branch-ownership-authorization.md`
- `007-branch-auto-accept-setting-not-wired-to-order-ingestion.md`
- `008-payment-proof-submit-path-missing-while-review-path-expects-submitted.md`
- `009-deferred-features-saved-and-reviews-still-exposed-in-v1.md`
- `010-search-contract-mismatch-vs-aligned-track-a-decisions.md`

## Intended use

- Convert these into implementation tickets or GitHub issues.
- Use with OpenSpec change `openspec/changes/alignment-track-a-ff/` for requirement-level deltas.
