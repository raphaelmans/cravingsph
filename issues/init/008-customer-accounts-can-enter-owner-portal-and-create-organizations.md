# Customer accounts can enter the owner portal and create organizations

Severity: high

## Summary

The app does not enforce strict customer-vs-owner portal separation. A normal customer account can navigate directly to `/organization/get-started`, open the owner onboarding wizard, create an organization, and use the owner portal without any owner-specific role or portal preference.

## Why this matters

- Violates the spec requirement for strict portal separation.
- Lets customer accounts escalate into owner workflows without the dedicated owner registration flow.
- Undermines the PRD story that owner registration determines owner routing.

## Expected

- Customer accounts should not be able to enter owner onboarding or create owner organizations.
- Owner access should require a distinct owner identity or persisted portal entitlement.

## Actual

- A newly created customer account was able to open `/organization/get-started`.
- The same account opened `/organization/onboarding`, completed organization creation, added a restaurant, and added a branch.
- The owner shell continued to label the account as `member`.

## Spec and story references

- `docs/prd.md`: owner onboarding stories 43 and 44
- `PROMPT_ORIGINAL.md`: "Strict portal separation: no portal switching between customer and owner"
- `specs/frontend-ui-scaffold/design.md`: customer and owner are separate identities with no portal switching
- `specs/frontend-ui-scaffold/requirements.md` Q6

## Browser evidence

- Verified with `playwright-cli` on March 10, 2026 against staging.
- A customer test account reached `/organization/get-started` and `/organization/onboarding`.
- The owner shell header displayed the new organization name and the role label `member`.

## Code evidence

- Owner layout only requires an authenticated session plus org existence check, not an owner role: [src/app/(owner)/layout.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/app/(owner)/layout.tsx#L10)
- Organization creation is exposed to any `protectedProcedure` user: [src/modules/organization/organization.router.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/modules/organization/organization.router.ts#L17)
- Owner registration uses the same generic register mutation and only stores org name in local storage: [src/features/auth/components/owner-register-form.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/auth/components/owner-register-form.tsx#L59)

## Repro

1. Register a normal customer account.
2. Sign in.
3. Navigate directly to `/organization/get-started`.
4. Open `/organization/onboarding`.
5. Create an organization from the wizard.
6. Observe the account now operates inside the owner shell.

## Recommended fix

- Add a persisted owner entitlement or portal preference and enforce it in the owner layout and org mutations.
- Prevent customer accounts from entering owner onboarding unless they were created through the owner path or explicitly upgraded.
