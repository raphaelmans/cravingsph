# Branch auto-accept setting not wired to order ingestion

Severity: medium

## Summary
Branch has `autoAcceptOrders` setting in UI and schema, but order creation/service path does not consume it.

## Expected
- If auto-accept is enabled, new eligible orders should transition accordingly.

## Actual
- Setting exists in branch DTO/UI.
- No corresponding order ingestion behavior found in order service path.

## Code references
- `src/shared/infra/db/schema/branch.ts`
- `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx`
- `src/modules/order/services/order.service.ts`

## Recommended fix
- Implement deterministic auto-accept behavior in order creation workflow.
- Ensure timeline records include auto-accept actor/system note.
