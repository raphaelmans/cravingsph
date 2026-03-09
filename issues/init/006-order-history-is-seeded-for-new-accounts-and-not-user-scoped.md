# Order history is seeded for new accounts and not user-scoped

Severity: high

## Summary

A newly created customer account sees a pre-filled order history immediately. The order history is not fetched from backend account records; it is a seeded client-side store shared by all users in the session.

## Why this matters

- Violates the PRD and user-story expectation that order history reflects the signed-in customer's past purchases.
- Breaks the empty-state acceptance criteria for customers with no prior orders.
- Undermines retention features like reorder and reviews because they act on demo records rather than real order records.

## Expected

- A new customer account with no purchases should see the empty state on `/orders`.
- Order history should be account-scoped and derived from real completed orders.

## Actual

- A brand-new test account opened `/orders` and immediately saw three historical orders.
- Stats were also pre-populated (`Completed orders: 2`, `Total tracked spend: ₱1,412`).
- The hook uses a hardcoded `INITIAL_STORE` with demo orders and reviews.

## Spec and story references

- PRD retention stories 38, 39, 40 in `docs/prd.md`
- `US-CUSTOMER-001`, `US-CUSTOMER-002`, `US-CUSTOMER-003`

## Code evidence

- Orders page mounts `CustomerOrdersPage`: [src/app/(public)/orders/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/orders/page.tsx)
- UI reads from `useCustomerOrders()`: [src/features/orders/components/customer-orders-page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/orders/components/customer-orders-page.tsx#L1)
- Hook seeds demo orders and reviews in `INITIAL_STORE`: [src/features/orders/hooks/use-customer-orders.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/orders/hooks/use-customer-orders.ts#L1)

## Repro

1. Create a new customer account with no real order history.
2. Open `/orders`.
3. Observe completed and cancelled demo orders are already present.

## Recommended fix

- Replace the seeded in-memory order store with real account-backed order history.
- Show the documented empty state for new accounts with no orders.
- Keep review eligibility and reorder behavior tied to real order records only.
