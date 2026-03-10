# Owner order actions lack explicit branch ownership authorization

Severity: critical

## Summary
Owner mutation paths (accept/reject/status/payment confirmation) do not show explicit branch ownership validation in order service methods.

## Expected
- Mutation actor MUST be authorized for the target branch/restaurant.

## Actual
- Service methods receive `userId` but transition/update operations rely mainly on order existence/status logic.
- No explicit branch ownership checks in these flows.

## Code references
- `src/modules/order/services/order.service.ts`
- `src/modules/order/order.router.ts`

## Recommended fix
- Enforce owner-to-branch authorization guard before any owner order mutation.
- Add tests for cross-branch mutation denial.
