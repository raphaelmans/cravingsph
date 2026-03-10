# Restaurant page allows checkout without order capability

Severity: critical

## Summary
Direct restaurant browsing path still exposes full menu/cart/checkout interaction despite Track A requiring read-only browse unless table ordering context exists.

## Expected
- Browse-only users should see read-only menu.
- Checkout controls should remain disabled/hidden until valid order capability is present.

## Actual
- `RestaurantMenu` renders cart + checkout surfaces by default.
- No capability guard wraps checkout path.

## Code references
- `src/app/(public)/restaurant/[slug]/page.tsx`
- `src/features/menu/components/restaurant-menu.tsx`

## Recommended fix
- Introduce capability-aware menu mode: `read_only` vs `order_enabled`.
- Gate all order-affecting actions behind capability checks.
