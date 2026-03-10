# User Journey Navigation Audit

Scope: customer portal navigation, route discoverability, and accessibility across all public and protected pages.

Issue files:

- `001-no-persistent-navigation-on-customer-portal.md` — critical (covers auth discoverability + protected page reachability)
- `002-scan-qr-button-conflicts-with-future-bottom-nav.md` — medium
- `003-redundant-ad-hoc-headers-across-pages.md` — medium
- `004-no-portal-switching-between-customer-and-owner.md` — medium
- `005-touch-targets-below-wcag-minimum-on-mobile.md` — high
- `006-no-nav-landmarks-or-skip-links-for-screen-readers.md` — high
- `007-hardcoded-hex-colors-break-dark-mode-and-token-system.md` — medium

Implementation order: 001 first (unblocks all navigation), then 002 (integrates QR into nav), then 003 (clean up ad-hoc headers now that shared nav exists). Issues 005–007 can be addressed in parallel.

Key files referenced:

- `src/components/layout/customer-shell.tsx` — bare wrapper, no nav
- `src/components/layout/customer-header.tsx` — exists but never rendered
- `src/app/(public)/layout.tsx` — mounts CustomerShell with no header
- `src/app/(public)/page.tsx` — homepage, no nav elements
- `src/features/discovery/components/scan-qr-cta.tsx` — fixed bottom-0 z-40
- `src/features/auth/hooks/use-auth.ts` — useSession() hook
- `src/common/app-routes.ts` — all routes defined
- `src/proxy.ts` — auth redirect handling
