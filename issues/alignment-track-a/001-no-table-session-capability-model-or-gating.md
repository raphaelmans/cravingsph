# No table-session capability model or gating

Severity: critical

## Summary
Track A requires order permission to be tied to an active table session. Current codebase has no explicit table/session capability model to enforce this.

## Expected
- System MUST represent a table session/order capability context.
- Order creation MUST validate that capability before accepting dine-in orders.

## Actual
- Order creation checks branch-level `isOrderingEnabled` only.
- No table-session identifier/capability appears in order DTOs/service contracts.

## Code references
- `src/modules/order/services/order.service.ts`
- `src/modules/order/services/branch-checker.ts`
- `src/modules/order/dtos/order.dto.ts`

## Recommended fix
- Add table-session capability model (token/session/claim) and validation gate in `order.create`.
- Reject dine-in submits without valid active capability.
