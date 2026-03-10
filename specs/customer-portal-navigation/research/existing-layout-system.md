# Existing Layout System — Research Notes

## CustomerShell (bare wrapper)

```
src/components/layout/customer-shell.tsx
```
- Minimal: `<div>` + `<main>` only — no header, no nav, no footer
- Used by `src/app/(public)/layout.tsx`

## CustomerHeader (exists, never rendered)

```
src/components/layout/customer-header.tsx
```
- Sticky, z-40, h-14, border-b
- Props: `showCart` (default true), `showAuth` (default false), `cartCount`, `onCartClick`
- Logo left, cart button + auth icon right
- **Zero imports anywhere** — never mounted

## BackButton (exists, never used)

```
src/components/brand/back-button.tsx
```
- Ghost variant, pill shape, `ChevronLeft` icon
- **Zero imports** — pages use inline `ArrowLeft` instead

## Owner Portal (for comparison)

- `DashboardShell` + `OwnerSidebar` — much richer layout
- `DashboardNavbar` with breadcrumbs and action slots
- Portal separation via `session.portalPreference`
- Owner layout checks org ownership, forces onboarding

## CartFloatingButton

```
src/features/cart/components/cart-floating-button.tsx
```
- Fixed bottom-0, z-40, safe-area-inset-bottom
- Only shows when itemCount > 0
- Will conflict with bottom nav (same z-index, same position)

## Mobile Detection

- `useIsMobile()` hook at 768px breakpoint (matches Tailwind `md:`)

## Key Observation

Customer portal has NO centralized navigation — each page handles its own header. Owner portal is fully structured with sidebar + navbar.
