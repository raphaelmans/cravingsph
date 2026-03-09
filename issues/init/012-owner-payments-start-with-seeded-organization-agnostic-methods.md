# Owner payments start with seeded organization-agnostic methods

Severity: medium

## Summary

A freshly created organization lands on `/organization/payments` with three pre-configured payment methods before the owner adds anything. The page is driven by a local seeded store rather than organization-backed data.

## Why this matters

- Violates the onboarding and payments stories that owners configure their accepted methods.
- Misrepresents a brand-new organization as already configured.
- Makes org-level payments appear complete even when no data has been saved for that org.

## Expected

- A new organization should start with zero configured payment methods and show the empty state.
- Payment methods should belong to the current organization.

## Actual

- The new organization immediately showed 3 configured methods.
- The default method was `GCash`.
- The hook is backed by a local `INITIAL_STATE`.

## Spec and story references

- `docs/prd.md`: owner payment stories 66 and 67

## Browser evidence

- Verified with `playwright-cli` on `/organization/payments`.
- The page showed `3 configured` for a brand-new organization.

## Code evidence

- Seeded methods and local store: [src/features/payment-config/hooks/use-payment-config.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/payment-config/hooks/use-payment-config.ts#L30)

## Repro

1. Create a new organization.
2. Open `/organization/payments`.
3. Observe three pre-seeded payment methods with a default already selected.

## Recommended fix

- Remove seeded payment methods from the authenticated owner flow.
- Load methods from organization-scoped backend data.
- Preserve the empty state until the owner actually configures methods.
