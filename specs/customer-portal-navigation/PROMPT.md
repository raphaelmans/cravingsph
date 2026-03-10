# Customer Portal Navigation

## Objective

Add persistent navigation to the customer portal: brand header, bottom nav (4 tabs + QR FAB), and shared subpage header — replacing all ad-hoc per-page headers. Fix accessibility landmarks, hardcoded colors, and add portal switching for owner-role users.

Full spec: `specs/customer-portal-navigation/`

## Key Requirements

- **Brand header** on tab roots (`/`, `/orders`, `/saved`, `/account`): logo left, cart + auth icon right. Session-aware — "Sign in" for guests, profile icon for authenticated.
- **Subpage header** on all other pages: back arrow (`router.back()`) + page title. Sticky, z-40, backdrop-blur.
- **Bottom nav** always visible on ALL pages: Home, Orders, QR scan (center FAB), Saved, Account. Active tab highlighted via `usePathname()`. Wrapped in `<nav aria-label="Main navigation">`.
- **QR FAB** replaces standalone `ScanQRCTA` — opens existing `QrScannerModal`.
- **Guest auth**: tapping protected tabs navigates to the route; proxy redirects to `/login?redirect=<target>`.
- **Portal switch**: Account page shows "Switch to Owner Portal" link for users with an organization (via `organization.mine()` tRPC). Same-tab navigation to `/organization`.
- **Accessibility**: skip-to-content link, single `<main id="main-content">` from shell only (remove nested `<main>` from pages), `<header>` landmark, `<nav>` landmark.
- **Design tokens**: replace `from-[#fff8f2]` with `from-peach` on Orders, Saved, Account pages.
- **Cart float**: reposition `CartFloatingButton` above bottom nav (change `bottom-0` to clear nav height).
- **Hard cutover**: remove all 5 ad-hoc headers (saved, orders, account, search, order detail). Pages declare title via `PageHeaderContext`.
- **Touch targets**: use shadcn/ui size variants as-is, no custom overrides.
- **Light mode only** — theme is forced light.

## Acceptance Criteria

- Given a tab root page, when loaded, then brand header shows logo + cart + auth state
- Given a non-tab page, when loaded, then subpage header shows back arrow + page title
- Given any page, when loaded, then bottom nav is visible with 5 slots, active tab highlighted
- Given the QR FAB is tapped, then QR scanner modal opens
- Given an unauthenticated user taps a protected tab, then proxy redirects to `/login?redirect=<target>`
- Given an authenticated user with an org visits Account, then "Switch to Owner Portal" link is visible
- Given an authenticated user without an org visits Account, then no portal switch is shown
- Given any page, then exactly one `<main>`, one `<header>`, one `<nav aria-label="Main navigation">` exist
- Given any page, then a skip-to-content link is the first focusable element
- Given Orders/Saved/Account pages, then gradient uses `from-peach` (no hardcoded `#fff8f2`)
- Given no page renders its own `<header>` — all handled by the shell
- Given a restaurant page with cart items, then CartFloatingButton clears the bottom nav

## Implementation

Follow the 12-step plan in `specs/customer-portal-navigation/plan.md`. Steps build incrementally — each results in working, demoable functionality.

## Key Files

Create: `customer-bottom-nav.tsx`, `subpage-header.tsx`, `page-header-context.tsx` (in `src/components/layout/`)

Modify: `customer-shell.tsx`, `customer-header.tsx`, `scan-qr-cta.tsx`, homepage `page.tsx`, `saved-restaurants-page.tsx`, `customer-orders-page.tsx`, `customer-account-page.tsx`, search `page.tsx`, `cart-floating-button.tsx`
