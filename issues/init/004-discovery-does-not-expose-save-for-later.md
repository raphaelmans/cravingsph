# Discovery does not expose save-for-later

Severity: medium

## Summary

The landing page and search result cards do not provide any bookmark or save affordance, even though saving restaurants is a defined customer discovery story and the app already has a saved-restaurants area.

## Why this matters

- The discovery funnel cannot satisfy the "save for later" retention story from the first touchpoint.
- Users must navigate away and there is no sign-in prompt path from discovery when trying to save.
- The absence is more noticeable because `/saved` exists as a route.

## Expected

- Restaurant cards in discovery should expose save/unsave.
- Guests should be prompted to sign in when attempting to save.

## Actual

- Discovery cards only link through to the restaurant page and render tags plus preview text.
- No save control is present on the landing page or search results.

## Spec and story references

- PRD discovery story 37 in `docs/prd.md`
- `US-CUSTOMER-006`
- `specs/frontend-ui-scaffold/requirements.md`: all 7 phases scaffolded upfront, including retention surfaces

## Code evidence

- Discovery card has only link, image fallback, tags, and preview text: [src/features/discovery/components/restaurant-card.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/discovery/components/restaurant-card.tsx#L19)
- Saved-restaurants UI exists separately, which shows the feature is conceptually present but not wired from discovery: [src/features/saved-restaurants/components/saved-restaurant-card.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/saved-restaurants/components/saved-restaurant-card.tsx#L1)

## Repro

1. Open `http://localhost:3000/` or `/search`.
2. Inspect any restaurant card.
3. Observe there is no save/bookmark action.

## Recommended fix

- Add save/unsave affordances to discovery cards.
- Route guests into login/register when they attempt to save.
- Keep saved state visible on both `/` and `/search`.
