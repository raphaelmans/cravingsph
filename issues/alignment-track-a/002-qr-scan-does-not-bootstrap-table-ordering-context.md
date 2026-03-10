# QR scan does not bootstrap table ordering context

Severity: high

## Summary
QR scanning currently resolves to restaurant slug navigation, not an authenticated/validated table ordering context.

## Expected
- QR should create/resolve table session capability context.
- Successful scan should enable order permission for that table session only.

## Actual
- Scanner parses slug/URL and redirects to `/restaurant/[slug]`.
- No table identifier/session capability is established.

## Code references
- `src/features/discovery/components/qr-scanner-modal.tsx`

## Recommended fix
- Encode table/session intent in QR payload.
- Exchange scan payload for server-issued short-lived order capability.
