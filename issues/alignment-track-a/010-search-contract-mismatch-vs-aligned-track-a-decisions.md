# Search contract mismatch vs aligned Track A decisions

Severity: medium

## Summary
Current discovery search supports text/cuisine/city filters, but does not implement explicit Food|Restaurant mode contract discussed in alignment.

## Expected
- Explicitly documented/implemented search contract for v1.
- Either: (a) Restaurant-only now, or (b) dual-mode with clear behavior.

## Actual
- Single search endpoint with query/cuisine/city.
- No first-class mode switch in API contract.

## Code references
- `src/modules/discovery/dtos/discovery.dto.ts`
- `src/modules/discovery/discovery.router.ts`
- `src/app/(public)/search/page.tsx`

## Recommended fix
- Lock one search contract for v1 and reflect in API/UI/docs.
- If dual-mode is deferred, codify as explicit non-goal for current cycle.
