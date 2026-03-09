# Search location filter is not functional

Severity: medium

## Summary

The discovery search UI exposes a location filter, but the filter is not applied to results at all. The selected location only changes the URL.

## Why this matters

- Violates the discovery filter story in the PRD.
- Creates a false sense of filtering and undermines trust in search results.
- Makes the landing-page search experience look more complete than it is.

## Expected

- Selecting a city or province should reduce results to matching restaurants.
- Clearing the location filter should restore the full browse set.

## Actual

- The search page reads `location` from the URL, but the filtering function only considers `query` and `cuisine`.
- The location options themselves are stubbed.

## Spec and story references

- PRD discovery story 34 in `docs/prd.md`
- `US-CUSTOMER-003`
- `specs/frontend-ui-scaffold/design.md`: discovery includes province/city filtering

## Code evidence

- `location` is read from search params and written back to the URL: [src/app/(public)/search/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/search/page.tsx#L139)
- `filterRestaurants` ignores location entirely: [src/app/(public)/search/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/search/page.tsx#L104)
- Location options are hardcoded stubs: [src/features/discovery/components/location-filter.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/discovery/components/location-filter.tsx#L22)

## Repro

1. Open `http://localhost:3000/search?cuisine=filipino`.
2. Choose any location from the location dropdown.
3. Observe the `location` query param changes.
4. Observe the result count and cards do not filter by that location.

## Recommended fix

- Add location fields to discovery records and apply them in the search predicate.
- Replace stub location options with the documented province/city source.
- Add coverage for combined `query + cuisine + location` filtering.
