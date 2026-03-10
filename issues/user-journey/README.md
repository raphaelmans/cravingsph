# User Journey Navigation Audit

Scope: customer portal navigation, route discoverability, and accessibility across all public and protected pages.

## Issue files

- `001-no-persistent-navigation-on-customer-portal.md` — critical (covers auth discoverability + protected page reachability)
- `002-scan-qr-button-conflicts-with-future-bottom-nav.md` — medium
- `003-redundant-ad-hoc-headers-across-pages.md` — medium
- `004-no-portal-switching-between-customer-and-owner.md` — medium
- `005-touch-targets-below-wcag-minimum-on-mobile.md` — high (deferred per spec decision)
- `006-no-nav-landmarks-or-skip-links-for-screen-readers.md` — high
- `007-hardcoded-hex-colors-break-dark-mode-and-token-system.md` — medium

## Spec status

Full spec: `specs/customer-portal-navigation/`

| Issue | Spec coverage | Plan step | Implementation |
|-------|--------------|-----------|----------------|
| 001 | Steps 1–5, AC1–AC5 | Steps 1–5 | Not started |
| 002 | Step 8, AC4 | Step 8 | Not started |
| 003 | Steps 6–7, AC11 | Steps 6–7 | Not started |
| 004 | Step 10, AC6–AC7 | Step 10 | Not started |
| 005 | Accepted as-is (Q6) | N/A | Deferred |
| 006 | Step 11, AC8–AC9 | Step 11 | Not started |
| 007 | Step 12, AC10 | Step 12 | Not started |

Implementation order: Steps 1–5 (nav core), then 6–8 (cleanup), then 9–12 (polish).

## Key files referenced

- `src/components/layout/customer-shell.tsx` — bare wrapper, no nav
- `src/components/layout/customer-header.tsx` — exists but never rendered
- `src/app/(public)/layout.tsx` — mounts CustomerShell with no header
- `src/app/(public)/page.tsx` — homepage, no nav elements
- `src/features/discovery/components/scan-qr-cta.tsx` — fixed bottom-0 z-40
- `src/features/auth/hooks/use-auth.ts` — useSession() hook
- `src/common/app-routes.ts` — all routes defined
- `src/proxy.ts` — auth redirect handling

## Open notes

- **Order detail page** (`src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx`) has an ad-hoc header not explicitly listed in plan Steps 6–7. Should be caught in Step 11 verification pass.
- **Owner sidebar reverse link** ("Switch to Customer View") is mentioned in Step 10 integration notes but not a formal AC. Could be missed.
- **Touch targets** accepted at shadcn defaults per user decision. Revisit if mobile user testing surfaces tap accuracy issues.
- **Project root PROMPT.md** references `specs/ui-audit-resolution/` (previous work round). The nav spec has its own PROMPT at `specs/customer-portal-navigation/PROMPT.md`.
