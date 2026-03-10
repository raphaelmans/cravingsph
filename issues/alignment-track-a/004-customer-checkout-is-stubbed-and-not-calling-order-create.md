# Customer checkout is stubbed and not calling order.create

Severity: high

## Summary
Customer checkout currently uses a mock timeout/random ID path and does not call backend order creation.

## Expected
- Checkout submission should call `trpc.order.create`.
- Success should return real persisted order id/number.

## Actual
- Temporary mock logic in menu component.
- No real order submission integration from checkout sheet.

## Code references
- `src/features/menu/components/restaurant-menu.tsx`

## Recommended fix
- Wire checkout payload to `order.create` mutation.
- Replace client-generated confirmation IDs with server response.
