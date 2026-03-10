# order.create requires auth, blocking guest table flow

Severity: high

## Summary
Track A dine-in QR flow expects low-friction guest ordering, but current `order.create` is protected and requires authenticated user session.

## Expected
- Support guest table ordering (or explicitly declare auth-required MVP and update flows/docs).

## Actual
- `order.create` is `protectedProcedure`.
- Guest path from table QR cannot complete if not authenticated.

## Code references
- `src/modules/order/order.router.ts`
- `src/shared/infra/trpc/trpc.ts`

## Recommended fix
- Add capability-based public/guest create route for table sessions, or
- lock explicit auth-required policy and align all UX/docs accordingly.
