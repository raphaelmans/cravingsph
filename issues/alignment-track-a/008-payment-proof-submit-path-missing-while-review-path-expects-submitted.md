# Payment proof submit path missing while review path expects submitted

Severity: high

## Summary
Owner-side payment review expects `submitted` state, but customer payment proof submit flow remains UI stub and does not persist proof/state transitions.

## Expected
- Customer submit should create proof record and set payment status to `submitted`.
- Owner review should consume persisted data.

## Actual
- Payment sheet/form are placeholder submit logic.
- Owner review component branches on `submitted` state.

## Code references
- `src/features/payment/components/payment-sheet.tsx`
- `src/features/payment/components/payment-proof-form.tsx`
- `src/features/order-management/components/payment-proof-review.tsx`

## Recommended fix
- Add backend payment-proof submit mutation + storage integration.
- Standardize status machine: pending → submitted → confirmed/rejected.
