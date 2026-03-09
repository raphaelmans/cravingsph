# Discovery cards use stub data and break on detail pages

Severity: high

## Summary

The landing page and discovery search are rendering hardcoded restaurant records instead of live platform listings. Those stub slugs do not resolve in the real restaurant detail route, so a primary landing-page action can immediately drop users into an error state.

## Why this matters

- Violates the PRD requirement for current featured and nearby listings.
- Breaks the main discovery-to-menu funnel from `/`.
- Makes the landing page look functional while routing into dead ends.

## Expected

- `/` should render live featured and nearby restaurant records.
- Clicking a discovery card should open a valid restaurant menu page.

## Actual

- `/` renders static arrays in the page file.
- `/search` renders the same static arrays.
- Clicking `Jollibee` from the landing page opened `/restaurant/jollibee-katipunan`, which failed with `TRPCError: Restaurant not found` and showed the customer error boundary in the browser.

## Spec and story references

- PRD discovery stories 32, 35 in `docs/prd.md`
- `US-CUSTOMER-001`, `US-CUSTOMER-004`
- `PROMPT_ORIGINAL.md`: "Scaffold the complete frontend ... route wirings and state management"
- `specs/frontend-ui-scaffold/requirements.md`: complete frontend upfront across all 7 phases

## Code evidence

- Landing page uses stub `FEATURED_RESTAURANTS` and `NEARBY_RESTAURANTS`: [src/app/(public)/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/page.tsx#L12)
- Search page uses stub `ALL_RESTAURANTS`: [src/app/(public)/search/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/search/page.tsx#L13)
- Discovery cards always link to `/restaurant/[slug]`: [src/features/discovery/components/restaurant-card.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/discovery/components/restaurant-card.tsx#L19)
- Restaurant detail is wired to live server data via tRPC and throws on missing slug: [src/app/(public)/restaurant/[slug]/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(public)/restaurant/[slug]/page.tsx#L12)

## Repro

1. Open `http://localhost:3000/`.
2. Click a restaurant card such as `Jollibee`.
3. Observe the route changes to `/restaurant/jollibee-katipunan`.
4. Observe the customer error state: "Something interrupted the customer flow".

## Recommended fix

- Replace landing and search stub arrays with real discovery queries.
- Ensure discovery cards only render restaurants that have valid public slugs and routable detail pages.
- Add a regression check that every card rendered on `/` resolves successfully to `/restaurant/[slug]`.
