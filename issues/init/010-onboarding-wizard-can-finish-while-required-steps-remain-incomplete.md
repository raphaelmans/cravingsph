# Onboarding wizard can finish while required steps remain incomplete

Severity: high

## Summary

The onboarding wizard can be completed by skipping menu, payments, and verification, yet it ends with “You’re All Set!” and “ready to start accepting orders.” The onboarding hub immediately contradicts that state and still reports only `3 of 7 steps complete`.

## Why this matters

- Misstates readiness to owners.
- Conflicts with the scaffold acceptance criterion that the dashboard appears after all 7 steps are done.
- Hides the fact that steps 4 to 6 are still placeholders or incomplete.

## Expected

- The wizard should not declare setup complete until the required steps are truly complete.
- Hub status and wizard completion state should agree.

## Actual

- Step 4 (`Build Menu`) is a placeholder with `Skip for Now`.
- Step 5 (`Payment Methods`) is a placeholder with `Skip for Now`.
- Step 6 (`Verification`) is a placeholder with `Skip for Now`.
- After skipping them, step 7 says “You’re All Set!”
- `/organization/get-started` then reports `3 of 7 steps complete` and shows Menu as `In Progress`.

## Spec and story references

- `docs/prd.md`: owner onboarding stories 44, 47, 48, 49
- `PROMPT_ORIGINAL.md` acceptance criteria: dashboard after all 7 steps are done
- `specs/frontend-ui-scaffold/requirements.md` Q10

## Browser evidence

- Verified with `playwright-cli` on the onboarding wizard.
- The wizard advanced from step 4 to 7 via `Skip for Now`.
- The completion screen claimed readiness.
- The hub still showed `43%` and `3 of 7 steps complete`.

## Code evidence

- Hub status hardcodes menu/payment/verification as not queryable and incomplete: [src/features/onboarding/hooks/use-onboarding-status.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/onboarding/hooks/use-onboarding-status.ts#L33)

## Repro

1. Complete steps 1 to 3 in `/organization/onboarding`.
2. On steps 4, 5, and 6, click `Skip for Now`.
3. Reach step 7 and observe the “You’re All Set!” messaging.
4. Open `/organization/get-started`.
5. Observe the hub still reports `3 of 7 steps complete`.

## Recommended fix

- Do not mark the wizard complete while required setup areas are still incomplete.
- Either make steps 4 to 6 real workflow steps or mark the completion screen as partial setup.
- Keep hub and wizard state driven from the same source of truth.
