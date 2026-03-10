# No persistent navigation on customer portal

Severity: critical

## Summary

The customer portal has no persistent header, bottom navigation bar, or shared navigation element. `CustomerShell` wraps pages in a bare `<div>` with only a `<main>` slot. The `CustomerHeader` component exists with logo, cart, and auth links but is never rendered. This single gap causes three downstream failures:

1. **Auth is undiscoverable** — no sign-in or register button visible anywhere. `CustomerHeader` has a `showAuth` prop linking to `/login` but defaults to `false` and is never mounted. Users can only reach `/login` by typing the URL or hitting a protected route redirect.
2. **Protected pages are unreachable** — `/orders`, `/saved`, and `/account` are fully built with page components and route protection, but zero UI elements link to them. Each page has a back-arrow to `/` but no inbound links from any other page.
3. **Users are trapped on their entry page** — QR scan users land on a restaurant page with no way to explore. Homepage users can only tap restaurant cards or scan QR.

## Why this matters

- Every mobile food-ordering app uses persistent navigation — its absence makes the product feel like a prototype.
- The auth redirect chain works end-to-end (`proxy.ts` → `login?redirect=` → post-login return) but has no front door.
- The save-for-later heart button saves data but users cannot view their saved list.
- Users who place orders have no way to find their order history afterward.

## Expected

- A persistent header (logo, cart, auth/profile icon) on all customer pages.
- A bottom navigation bar with tabs for Home, Orders, Saved, and Account (Search folded into the Home hero).
- QR scan integrated as a center FAB in the bottom nav (see issue 004).
- Navigation state reflects the current route.
- For unauthenticated users, tapping protected tabs redirects to `/login?redirect=<target>`.

## Actual

- `CustomerShell` renders only `<main>{children}</main>` — no header, no footer, no nav.
- `CustomerHeader` is defined but imported nowhere.
- `(public)/layout.tsx` mounts `<CustomerShell>` bare.
- Homepage renders hero, cuisine pills, restaurant lists, QR button — no auth or nav links.
- No `<Link>` or `<a>` in any rendered component points to `/orders`, `/saved`, or `/account`.
- The account page internally links to `/orders` and `/saved`, but account itself has no inbound link.

## Code evidence

- `CustomerShell` is a bare wrapper: [src/components/layout/customer-shell.tsx:8–17](src/components/layout/customer-shell.tsx#L8)
- `CustomerHeader` exists but is never imported: [src/components/layout/customer-header.tsx:17–65](src/components/layout/customer-header.tsx#L17)
- Public layout mounts shell bare: [src/app/(public)/layout.tsx:16–22](src/app/(public)/layout.tsx#L16)
- Homepage has no nav elements: [src/app/(public)/page.tsx:18–56](src/app/(public)/page.tsx#L18)
- Protected routes defined but unlinked: [src/common/app-routes.ts:41–52](src/common/app-routes.ts#L41)
- `showAuth` defaults to `false`: [src/components/layout/customer-header.tsx:11](src/components/layout/customer-header.tsx#L11)
- Proxy handles auth redirects proving plumbing works: [src/proxy.ts:58–63](src/proxy.ts#L58)
- Login route supports `?redirect=` for post-auth return: [src/common/app-routes.ts:58](src/common/app-routes.ts#L58)
- Orders page back-arrow to `/`, no inbound links: [src/features/orders/components/customer-orders-page.tsx:106](src/features/orders/components/customer-orders-page.tsx#L106)
- Saved page back-arrow to `/`, no inbound links: [src/features/saved-restaurants/components/saved-restaurants-page.tsx:34–39](src/features/saved-restaurants/components/saved-restaurants-page.tsx#L34)
- Account page back-arrow to `/`, no inbound links: [src/features/customer-account/components/customer-account-page.tsx:91](src/features/customer-account/components/customer-account-page.tsx#L91)

## Recommended fix

1. Mount `CustomerHeader` in `CustomerShell` with session-aware auth icon (show "Sign in" for guests, avatar for authenticated users).
2. Create a `CustomerBottomNav` with 4 tabs: Home, Orders, Saved, Account. Integrate QR scan as the center FAB (see issue 004).
3. Mount bottom nav in `CustomerShell` below `<main>`.
4. Use `usePathname()` to highlight the active tab.
5. For unauthenticated users, tapping Orders/Saved/Account navigates to the route and lets the proxy redirect to `/login?redirect=<target>`.
6. Search remains accessible via the hero search bar on the Home tab — no dedicated Search tab needed.
