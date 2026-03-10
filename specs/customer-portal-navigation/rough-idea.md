# Customer Portal Navigation — Rough Idea

Source: `issues/user-journey/` audit (7 issues)

## Core Problem

The customer portal has no persistent navigation. Users are trapped on their entry page with no way to reach auth, orders, saved restaurants, or account settings. The app feels like a prototype despite having fully built pages behind unreachable routes.

## Issues to Address

1. **No persistent navigation** (critical) — `CustomerShell` is a bare wrapper; `CustomerHeader` exists but is never rendered; no bottom nav exists; protected pages (`/orders`, `/saved`, `/account`) have no inbound links.

2. **QR scan button conflicts with future bottom nav** (medium) — `ScanQRCTA` is `fixed bottom-0 z-40`; will overlap bottom nav; should be integrated as center FAB.

3. **Redundant ad-hoc headers** (medium) — 5+ pages each build their own header with back-arrow; inconsistent styling; will conflict with shared header.

4. **No portal switching** (medium) — Users with both customer and owner roles can't switch between portals without manually typing URLs.

5. **Touch targets below WCAG minimum** (high) — Default buttons 36px, small buttons 32px, quantity picker 32px, save heart 32px; all below 44px minimum.

6. **No nav landmarks or skip links** (high) — Zero `<nav>` elements in customer portal; no skip-to-content; nested `<main>` tags (invalid HTML).

7. **Hardcoded hex colors** (medium) — `#fff8f2` used in 3 pages instead of design tokens; breaks dark mode.

## Desired Outcome

A mobile-first customer portal with persistent header, bottom navigation (Home, QR scan FAB, Orders, Saved, Account), proper accessibility landmarks, WCAG-compliant touch targets, portal switching for dual-role users, and consistent design token usage.
