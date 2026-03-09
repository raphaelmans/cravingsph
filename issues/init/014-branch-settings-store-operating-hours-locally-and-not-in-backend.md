# Branch settings store operating hours locally and not in backend

Severity: medium

## Summary

Branch operating hours in the owner settings page are explicitly local-only and stored in a client-side in-memory store. They are not persisted to the branch record.

## Why this matters

- Violates the settings story for branch operating hours.
- Creates a false sense that schedule edits are saved.
- Risks owners making configuration changes that disappear on refresh or across browsers.

## Expected

- Operating hours should be persisted per branch and reflected consistently across sessions.

## Actual

- The settings UI itself says weekly hours are stored locally for now.
- The hook maintains `weeklyHoursStore` entirely on the client.

## Spec and story references

- `docs/prd.md`: owner settings story 76

## Browser evidence

- Verified with `playwright-cli` on the branch settings page.
- The page copy states: "Weekly hours are stored locally for now until branch scheduling fields are added to the backend."

## Code evidence

- Local in-memory store for weekly hours: [src/features/branch-settings/hooks/use-branch-settings.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/branch-settings/hooks/use-branch-settings.ts#L28)

## Recommended fix

- Persist operating hours to branch data instead of a client-only store.
- If persistence is not ready, make the scaffold state explicit and avoid implying a saved configuration.
