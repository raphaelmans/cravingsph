# Reorder from order history routes into a broken restaurant page

Severity: high

## Summary

The `Reorder` action on `/orders` adds demo items into the cart and then routes the customer to a restaurant slug that does not exist in the live public menu data. The result is an interrupted customer flow instead of a usable reorder experience.

## Why this matters

- Directly violates the reorder user story.
- Creates side effects in the cart even though the destination page fails.
- Makes the retention path unusable for the very action it is supposed to optimize.

## Expected

- Reorder should restore valid items into the cart for a real branch and land on a working restaurant menu page.
- If the restaurant or items are unavailable, the user should get a graceful fallback.

## Actual

- Clicking the first `Reorder` button on `/orders` navigated to `/restaurant/mang-inasal-sm-north`.
- The destination page failed with `TRPCError: Restaurant not found` and showed the customer error boundary.
- Local storage shows the cart was still populated with demo reorder items before the route failed.

## Spec and story references

- PRD retention story 39 in `docs/prd.md`
- `US-CUSTOMER-002`

## Code evidence

- Reorder handler pushes to the restaurant slug after adding items: [src/features/orders/components/customer-orders-page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/orders/components/customer-orders-page.tsx#L39)
- Reorder source data comes from demo order records: [src/features/orders/hooks/use-customer-orders.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/orders/hooks/use-customer-orders.ts#L1)
- Public restaurant page requires a real backend slug and fails when missing: [src/app/(public)/restaurant/[slug]/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/restaurant/[slug]/page.tsx#L12)

## Repro

1. Sign in as a customer and open `/orders`.
2. Click the first `Reorder` button.
3. Observe navigation to `/restaurant/mang-inasal-sm-north`.
4. Observe the customer error state.
5. Inspect `localStorage` and observe `cravings-cart` has already been populated with reorder items.

## Recommended fix

- Only allow reorder against real restaurants and live menu items.
- Validate the target restaurant before mutating the cart and routing.
- If a reorder target is invalid, keep the user on `/orders` and explain what failed.
