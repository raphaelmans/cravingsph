# Owner navigation and dashboard link to missing routes

Severity: high

## Summary

The owner sidebar and dashboard quick actions expose multiple routes that do not exist. These links lead straight to 404 pages from the main owner navigation.

## Why this matters

- Breaks core owner flows from the primary navigation.
- Makes the dashboard look more complete than the route tree actually is.
- Blocks multiple owner story areas from even starting.

## Expected

- Sidebar and dashboard actions should only link to implemented routes.
- Missing areas should be hidden, disabled, or clearly labeled as pending.

## Actual

- The following owner links 404:
  - `/organization/orders`
  - `/organization/team`
  - `/organization/settings`
  - `/organization/profile`
- The owner dashboard quick actions also point to `/organization/orders` and `/organization/team`.

## Spec and story references

- Owner order management, team access, and settings stories in `docs/prd.md`
- `specs/frontend-ui-scaffold/design.md` route map includes `team`, `settings`, and owner account under `/account/profile`, not `/organization/profile`

## Browser evidence

- Verified with `playwright-cli`.
- Navigating to `/organization/orders`, `/organization/team`, `/organization/settings`, and `/organization/profile` returned 404 pages.

## Code evidence

- Sidebar nav links: [src/app/(owner)/sidebar.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(owner)/sidebar.tsx#L63)
- Dashboard quick links: [src/app/(owner)/organization/page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(owner)/organization/page.tsx#L102)
- Existing owner routes on disk do not include those paths: [src/app/(owner)](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(owner))

## Repro

1. Sign in to an account that can reach the owner shell.
2. Click `Orders`, `Team`, `Settings`, or `Profile` from the sidebar.
3. Observe a 404 page.

## Recommended fix

- Remove or disable dead links until the routes exist.
- Align the sidebar with the actual route tree.
- If owner profile is intended, point to `/account/profile`, which is the route constant in `appRoutes`.
