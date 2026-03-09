# Owner order dashboard falls back to seeded shared orders for any branch

Severity: high

## Summary

The owner order dashboard shows seeded in-memory orders even for a newly created branch with no real orders. If a branch-specific match is missing, the hook falls back to the entire shared demo order list.

## Why this matters

- Violates the expectation that branch order inboxes are branch-specific.
- Makes new branches look like they already have active operations.
- Any accept/reject/status actions are acting on demo records, not real branch orders.

## Expected

- A new branch with no orders should show the empty state.
- Order data should be scoped to the selected branch.

## Actual

- The newly created branch `Main Branch` showed Inbox/Active/Completed/Cancelled counts and seeded order `#1001`.
- The hook explicitly returns `snapshot.orders` when no branch-specific records are found.

## Spec and story references

- `docs/prd.md`: owner order management stories 59 to 65

## Browser evidence

- Verified with `playwright-cli` on `/organization/restaurants/.../branches/.../orders`.
- New branch showed seeded operational data instead of an empty state.

## Code evidence

- Branch fallback to shared seed data: [src/features/order-management/hooks/use-order-management.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/order-management/hooks/use-order-management.ts#L342)

## Repro

1. Create a new organization, restaurant, and branch.
2. Open that branch's orders page.
3. Observe seeded tabs and order records even though the branch has no real orders.

## Recommended fix

- Remove the fallback to the global seeded order list.
- Show the empty state when a branch has no orders.
- Keep order mutations disabled or clearly scaffolded until real branch data exists.
