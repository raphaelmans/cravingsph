# Scan QR CTA is a placeholder

Severity: high

## Summary

The landing page exposes a primary `Scan cravings QR` call to action, but clicking it only shows a "coming soon" toast. There is no scanner flow and no QR-entry fallback.

## Why this matters

- QR is one of the platform's main customer entry points in the PRD.
- The CTA is visible and prominent on `/`, so users can hit a dead end immediately.
- This is explicitly called out in the discovery stories and scaffold acceptance criteria.

## Expected

- Tapping `Scan cravings QR` should open a QR scanning experience or a clear manual QR-entry flow.

## Actual

- Tapping the CTA leaves the user on `/` and shows a placeholder toast.

## Spec and story references

- PRD solution and discovery story 36 in `docs/prd.md`
- `US-CUSTOMER-005`
- `PROMPT_ORIGINAL.md` acceptance criteria: visible Scan QR option that opens a QR scanning or QR-entry experience

## Code evidence

- The CTA only calls `toast.info("QR scanner coming soon!")`: [src/features/discovery/components/scan-qr-cta.tsx](/Users/raphaelm/Documents/Coding/startups/cravingsph/src/features/discovery/components/scan-qr-cta.tsx#L7)

## Repro

1. Open `http://localhost:3000/`.
2. Tap `Scan cravings QR`.
3. Observe there is no route change and no scan or entry surface opens.

## Recommended fix

- Replace the placeholder with a real scanner or manual QR code entry flow.
- If native camera access is deferred, provide a working fallback path now instead of a dead CTA.
