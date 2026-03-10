# Scan QR button conflicts with future bottom nav

Severity: medium

## Summary

The `ScanQRCTA` component is positioned as a `fixed inset-x-0 bottom-0 z-40` element on the homepage. When a persistent bottom navigation bar is added (see issue 001), this floating button will overlap or conflict with the nav bar, creating a z-index battle and obscuring navigation tabs.

## Why this matters

- Bottom navigation is the standard mobile pattern for apps like this — the QR button's current position directly occupies that space.
- The QR button uses `z-40`, which is the same z-index as `CustomerHeader` — adding bottom nav at the same level will create visual stacking conflicts.
- On shorter screens, the button already overlaps the bottom of the restaurant list (`pb-24` on the homepage compensates for this).
- The current `pb-24` padding hack on the homepage will need to be reconciled with bottom nav padding.

## Expected

- QR scan functionality remains easily accessible.
- Bottom navigation renders without overlap or z-index conflicts.
- The QR scan action integrates cleanly into the nav layout (e.g., as a center FAB in the bottom nav, or as an icon within the nav bar).

## Actual

- `ScanQRCTA` renders a `fixed bottom-0 z-40` pill button centered at the bottom of the viewport.
- Homepage adds `pb-24` to prevent content from being hidden behind the fixed button.
- No bottom nav exists yet, so the conflict is latent but will surface immediately when nav is added.

## Code evidence

- QR CTA uses `fixed inset-x-0 bottom-0 z-40`: [src/features/discovery/components/scan-qr-cta.tsx:14–15](src/features/discovery/components/scan-qr-cta.tsx#L14)
- Homepage compensates with `pb-24` on the main container: [src/app/(public)/page.tsx:19](src/app/(public)/page.tsx#L19)
- `CustomerHeader` also uses `z-40` for its sticky positioning: [src/components/layout/customer-header.tsx:28](src/components/layout/customer-header.tsx#L28)

## Recommended fix

1. Replace the standalone floating button with a center FAB in the 4-tab bottom nav (Home, [QR scan], Orders, Saved, Account). The QR button becomes the prominent center action — visually elevated but structurally part of the nav.
2. Remove the `pb-24` homepage hack and let the bottom nav component handle its own safe-area padding via `pb-[max(theme(spacing.16),env(safe-area-inset-bottom))]` or similar.
3. Establish a z-index scale (header: 40, bottom-nav: 40, modals: 50) to prevent stacking conflicts.
4. On pages where QR scan is irrelevant (e.g., account settings), the center button can still open the scanner — it's a global action, not page-specific.
