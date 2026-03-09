# Owner verification seeds uploaded documents and under-review state

Severity: high

## Summary

A newly created restaurant appears in the verification workspace as `Under review` with all three documents already uploaded. The verification hook seeds uploaded files and a submitted timestamp from the restaurant verification status instead of reflecting real owner uploads.

## Why this matters

- Breaks the owner verification flow by pretending required work is already done.
- Prevents realistic testing of document upload and submission.
- Misleads the owner immediately after creating a restaurant.

## Expected

- A new restaurant with no document uploads should start in `Draft` with zero uploaded documents.
- Documents and submission status should reflect actual owner actions.

## Actual

- The newly created restaurant on `/organization/verify` showed:
  - `Under review`
  - `3 of 3 documents ready`
  - seeded filenames and timestamps from March 6, 2026
- This happened before any user-upload action.

## Spec and story references

- `docs/prd.md`: owner onboarding stories 47 and 48

## Browser evidence

- Verified with `playwright-cli` on `/organization/verify`.
- The just-created restaurant immediately rendered a fully uploaded package under review.

## Code evidence

- Pending restaurants are converted into seeded uploaded documents and `under_review`: [src/features/verification/hooks/use-owner-verification.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/verification/hooks/use-owner-verification.ts#L111)

## Repro

1. Create a new restaurant through owner onboarding.
2. Open `/organization/verify`.
3. Observe the restaurant already has uploaded documents and a submitted state.

## Recommended fix

- Start new restaurants in a true draft verification state with no uploaded files.
- Only move to `ready` or `under_review` after real uploads and explicit submit.
