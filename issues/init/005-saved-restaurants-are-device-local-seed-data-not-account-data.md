# Saved restaurants are device-local seed data, not account data

Severity: high

## Summary

A brand-new customer account lands on `/saved` with three pre-populated restaurants. The saved list is not loaded from account data; it is seeded client-side and stored in `localStorage`, so favorites are device-scoped instead of user-scoped.

## Why this matters

- Violates the PRD expectation that saved restaurants belong to the signed-in customer account.
- Breaks the empty-state acceptance criteria for new accounts.
- Risks cross-account leakage on shared devices because favorites persist locally.

## Expected

- A newly created account with no favorites should see the empty state on `/saved`.
- Saved restaurants should be tied to the authenticated user, not the browser's local storage.

## Actual

- A new test account was created and immediately reached `/saved`.
- `/saved` showed three existing saved restaurants: Mang Inasal, Lugawan sa Kanto, and Brew Coffee Co.
- The implementation uses a seeded `INITIAL_STORE` and persists it via `localStorage`.

## Spec and story references

- PRD discovery story 37 and retention expectations in `docs/prd.md`
- `US-CUSTOMER-006` in discovery
- `specs/frontend-ui-scaffold/requirements.md`: authenticated customer pages under `(public)` with auth checks

## Code evidence

- Protected route exists at `/saved`: [src/app/(public)/saved/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/saved/page.tsx)
- Saved page reads from `useSavedRestaurants()`: [src/features/saved-restaurants/components/saved-restaurants-page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/saved-restaurants/components/saved-restaurants-page.tsx#L1)
- Hook seeds three demo restaurants and persists them to `localStorage`: [src/features/saved-restaurants/hooks/use-saved-restaurants.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/saved-restaurants/hooks/use-saved-restaurants.ts#L1)

## Repro

1. Clear cookies.
2. Visit `/saved` and confirm redirect to `/login?redirect=%2Fsaved`.
3. Create a brand-new customer account.
4. Return to `/saved`.
5. Observe the page is already populated with three saved restaurants instead of an empty state.

## Recommended fix

- Replace the local seeded store with account-backed saved-restaurant queries and mutations.
- Remove demo seed data from authenticated retention surfaces.
- Ensure logout/login on the same device does not leak one user's saved list into another user's session.
