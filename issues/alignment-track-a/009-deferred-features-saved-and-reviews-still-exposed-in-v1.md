# Deferred features (Saved/Reviews) still exposed in v1

Severity: medium

## Summary
Alignment decision defers Saved Restaurants and Reviews for v1, but these modules/routes remain active in current app paths.

## Expected
- Deferred features hidden/disabled behind explicit feature flags.

## Actual
- Saved and reviews routers/components/pages are present and wired.

## Code references
- `src/app/(public)/saved/page.tsx`
- `src/modules/saved-restaurant/saved-restaurant.router.ts`
- `src/features/orders/components/restaurant-reviews.tsx`
- `src/modules/review/review.router.ts`

## Recommended fix
- Add v1 feature flags and conditionally hide routes/components.
- Keep APIs disabled or internal-only until phase re-enabled.
