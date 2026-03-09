# Admin user access toggle is local scaffold only

Severity: medium

## Summary

The admin user management flow includes deactivate/reactivate actions, but the code explicitly implements them as a local in-session toggle instead of a persisted backend operation.

## Why this matters

- The UI suggests account access is being managed when it is not.
- Support and moderation workflows cannot rely on the result.
- Admin actions may appear to work during a session but have no lasting effect.

## Expected

- Admin user access changes should persist through a real backend/admin operation.

## Actual

- `setAdminUserActive` only updates an in-memory client store.
- The page copy states the deactivate action remains a local scaffold until backend support exists.

## Spec and story references

- `docs/prd.md`: admin platform operations story 85

## Verification note

- Full admin UI was not end-to-end browser-tested because no admin credentials were available in this pass.
- This issue is source-backed from the current implementation.

## Code evidence

- Local access store and setter: [src/features/admin/hooks/use-admin-users.ts](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/admin/hooks/use-admin-users.ts#L14)
- User management page explicitly labels the backend gap: [src/features/admin/components/admin-user-management-page.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/admin/components/admin-user-management-page.tsx#L156)

## Recommended fix

- Replace the local toggle with a persisted admin action.
- If that backend is not ready, downgrade the UI from an actionable control to a clearly labeled placeholder.
