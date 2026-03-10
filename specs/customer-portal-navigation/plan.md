# Implementation Plan — Customer Portal Navigation

## Checklist

- [ ] Step 1: Create `SubpageHeader` component
- [ ] Step 2: Create `CustomerBottomNav` component
- [ ] Step 3: Create `PageHeaderContext` and wire shell orchestration
- [ ] Step 4: Modify `CustomerHeader` for session-aware auth
- [ ] Step 5: Rewire `CustomerShell` as layout orchestrator
- [ ] Step 6: Remove ad-hoc headers from Saved, Orders, Account pages
- [ ] Step 7: Remove ad-hoc header from Search page
- [ ] Step 8: Replace `ScanQRCTA` with bottom nav FAB
- [ ] Step 9: Fix `CartFloatingButton` positioning above bottom nav
- [ ] Step 10: Add portal switching to Account page
- [ ] Step 11: Fix accessibility — landmarks, skip-link, nested `<main>`
- [ ] Step 12: Replace hardcoded hex colors with design tokens

---

## Step 1: Create `SubpageHeader` component

**Objective:** Build the shared contextual header for non-tab pages, normalizing all ad-hoc header patterns into one component.

**Implementation guidance:**
- Create `src/components/layout/subpage-header.tsx`
- Props: `title: string`, `label?: string`, `className?: string`
- Markup: `sticky top-0 z-40 border-b border-primary/10 bg-background/90 backdrop-blur`
- Back button: `size-10 rounded-full border border-primary/10 bg-background text-primary hover:bg-primary/5` with `ArrowLeft size-5`, calls `router.back()`
- Label: `text-xs font-medium uppercase tracking-[0.24em] text-primary`
- Title: `font-heading text-xl font-bold`
- Container: `max-w-4xl mx-auto`
- Wrap in `<header data-slot="subpage-header">`

**Test requirements:**
- Renders title and label when provided
- Renders title without label when label omitted
- Back button calls `router.back()`
- Has correct aria-label on back button

**Integration notes:** Not yet mounted — Step 5 wires it into the shell.

**Demo:** Component renders in isolation with title "Order history" and label "Retention".

---

## Step 2: Create `CustomerBottomNav` component

**Objective:** Build the 5-slot bottom navigation bar with tab highlighting and QR scan FAB.

**Implementation guidance:**
- Create `src/components/layout/customer-bottom-nav.tsx`
- No props — reads `usePathname()` for active tab, opens QR modal internally
- Wrap in `<nav aria-label="Main navigation">`
- Fixed bottom-0, z-40, `bg-background border-t`, safe-area-inset-bottom padding: `pb-[max(0.5rem,env(safe-area-inset-bottom))]`
- 5 slots in a flex row:
  - Home (`/`) — `Home` icon
  - Orders (`/orders`) — `Receipt` icon
  - QR scan (center) — `ScanLine` icon, visually elevated (larger circle, `bg-primary text-primary-foreground`, negative top margin or raised)
  - Saved (`/saved`) — `Heart` icon
  - Account (`/account`) — `User` icon
- Each tab: `<Link href={route}>` with icon + label text (small), `aria-current="page"` when active
- Active state: `text-primary`, inactive: `text-muted-foreground`
- QR FAB: `<button>` that opens `QrScannerModal` (import from existing)
- Tab routes use `appRoutes` constants

**Test requirements:**
- Renders 4 tab links + 1 QR button
- Correct tab highlighted for each route (`/`, `/orders`, `/saved`, `/account`)
- QR button opens scanner modal
- `aria-current="page"` set on active tab
- `<nav>` has `aria-label="Main navigation"`

**Integration notes:** Not yet mounted — Step 5 wires it into the shell.

**Demo:** Bottom nav renders with Home tab active, tapping QR opens scanner.

---

## Step 3: Create `PageHeaderContext` and wire shell orchestration

**Objective:** Create the context that lets pages declare their subpage header config, and the logic for the shell to decide which header to show.

**Implementation guidance:**
- Create `src/components/layout/page-header-context.tsx`
- Export `PageHeaderProvider`, `useSetPageHeader(config)`, and `usePageHeader()`
- `PageHeaderConfig`: `{ title: string; label?: string }`
- `useSetPageHeader` calls `useEffect` to set context value on mount, clears on unmount
- Export `TAB_ROOT_PATHS = ['/', '/orders', '/saved', '/account']` constant
- Export `useIsTabRoot()` hook: `TAB_ROOT_PATHS.includes(usePathname())`

**Test requirements:**
- `useIsTabRoot()` returns true for `/`, `/orders`, `/saved`, `/account`
- `useIsTabRoot()` returns false for `/restaurant/test`, `/search`
- `useSetPageHeader` updates context value
- Context clears when component unmounts

**Integration notes:** Shell uses `useIsTabRoot()` to choose header. Subpages use `useSetPageHeader()`.

**Demo:** N/A — infrastructure component.

---

## Step 4: Modify `CustomerHeader` for session-aware auth

**Objective:** Make the header always show the correct auth state instead of relying on a `showAuth` prop.

**Implementation guidance:**
- Modify `src/components/layout/customer-header.tsx`
- Remove `showAuth` prop — always render auth area
- Import `useSession()` from `@/features/auth/hooks/use-auth`
- If session loading: render skeleton circle (size-9)
- If authenticated: render profile icon (avatar or `User` icon) — can link to `/account`
- If unauthenticated: render "Sign in" button linking to `/login`
- Keep `showCart`, `cartCount`, `onCartClick` props
- Keep existing `<header>` tag, sticky, z-40

**Test requirements:**
- Renders logo linking to `/`
- Shows "Sign in" when unauthenticated
- Shows profile icon when authenticated
- Shows cart with count badge when `cartCount > 0`

**Integration notes:** Now ready to be mounted by the shell.

**Demo:** Header shows logo + cart + "Sign in" for guests, logo + cart + avatar for authenticated users.

---

## Step 5: Rewire `CustomerShell` as layout orchestrator

**Objective:** Transform the bare wrapper into the central layout component that mounts header, bottom nav, and manages page structure.

**Implementation guidance:**
- Modify `src/components/layout/customer-shell.tsx`
- Make it a client component (`"use client"`)
- Wrap children in `PageHeaderProvider`
- Add skip-to-content link: `<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">Skip to content</a>`
- Use `useIsTabRoot()`:
  - Tab root → render `<CustomerHeader />`
  - Subpage → render `<SubpageHeader />` reading from page header context
- Keep `<main id="main-content" className="flex-1">`
- Add bottom padding to `<main>` to clear bottom nav: `pb-20` (approx height of nav + safe area)
- Mount `<CustomerBottomNav />` after main

**Test requirements:**
- Skip-to-content link exists and targets `#main-content`
- Brand header shown on `/`
- Subpage header shown on `/restaurant/test`
- Bottom nav always rendered
- Single `<main>` with `id="main-content"`

**Integration notes:** This is the critical integration step. After this, the shell is fully functional. Steps 6-8 clean up pages to work with the new shell.

**Demo:** Navigate between Home and a restaurant page — header swaps between brand and contextual. Bottom nav visible on both. Skip-link focusable via Tab key.

---

## Step 6: Remove ad-hoc headers from Saved, Orders, Account pages

**Objective:** Strip inline headers from the three account-style pages and wire them to the page header context.

**Implementation guidance:**
- **Saved** (`src/features/saved-restaurants/components/saved-restaurants-page.tsx`):
  - Remove the entire `<header>...</header>` block
  - Remove nested `<main>` — use `<div>` or fragment instead
  - Add `useSetPageHeader({ title: "Saved restaurants", label: "Retention" })`
  - Replace `from-[#fff8f2]` with `from-peach` (done here, but also Step 12)
- **Orders** (`src/features/orders/components/customer-orders-page.tsx`):
  - Same pattern: remove header, remove nested `<main>`, add `useSetPageHeader({ title: "Order history", label: "Retention" })`
  - Replace `from-[#fff8f2]` with `from-peach`
- **Account** (`src/features/customer-account/components/customer-account-page.tsx`):
  - Same pattern: remove header, remove nested `<main>`, add `useSetPageHeader({ title: "Profile settings", label: "Account" })`
  - Replace `from-[#fff8f2]` with `from-peach`

**Test requirements:**
- No `<header>` element rendered by any of these pages
- No nested `<main>` element
- Page header context receives correct title and label
- Background gradient uses `from-peach` token

**Integration notes:** Pages now rely on the shell for their header. The shell reads the page header context and renders `SubpageHeader`.

**Demo:** Navigate to Orders tab — subpage header shows "Retention / Order history", no duplicate header, peach gradient background.

---

## Step 7: Remove ad-hoc header from Search page

**Objective:** Strip the search page's inline header and adapt it to the shell's subpage header.

**Implementation guidance:**
- Modify `src/app/(public)/search/page.tsx`
- Remove the back arrow + sticky container from the top
- Add `useSetPageHeader({ title: "Search" })`
- Keep the search input and filter bars — move them into the page body (below the subpage header) as a sticky filter section
- The search input + filters become a `sticky top-14` section (below the shell header height)

**Test requirements:**
- No inline header with back arrow
- Subpage header shows "Search" title with back button
- Search input and filters still functional and sticky
- Filter bar scrolls correctly beneath the subpage header

**Integration notes:** Search page has unique UI (search input + filters) that doesn't fit purely in `SubpageHeader`. The search form stays in the page body as a sticky section.

**Demo:** Navigate to /search — subpage header shows "Search" with back arrow, search input + filters below it and still sticky.

---

## Step 8: Replace `ScanQRCTA` with bottom nav FAB

**Objective:** Remove the standalone floating QR button from the homepage since the bottom nav now provides this functionality.

**Implementation guidance:**
- Modify `src/app/(public)/page.tsx`:
  - Remove `<ScanQRCTA />` import and render
  - Remove the `pb-24` padding hack (bottom nav padding is handled by the shell's `<main>`)
  - Remove nested `<main>` tag — use `<div>` or fragment
- Optionally: keep `scan-qr-cta.tsx` file but don't import it, or delete it if no other page uses it
- The QR scan functionality now lives exclusively in `CustomerBottomNav`'s center FAB

**Test requirements:**
- Homepage does not render a floating QR button
- QR scan still accessible via bottom nav FAB
- No `pb-24` hack on homepage
- No nested `<main>` on homepage

**Integration notes:** QR scanner modal is shared — `CustomerBottomNav` imports `QrScannerModal` directly.

**Demo:** Homepage shows restaurant cards without floating bottom button. QR scan accessible via center FAB in bottom nav.

---

## Step 9: Fix `CartFloatingButton` positioning above bottom nav

**Objective:** Ensure the cart floating button doesn't overlap the always-visible bottom nav.

**Implementation guidance:**
- Modify `src/features/cart/components/cart-floating-button.tsx`
- Change from `bottom-0` to `bottom-20` (or similar, matching bottom nav height + padding)
- Alternatively, use a CSS variable `--bottom-nav-height` set by the bottom nav component
- Keep z-40 (same level as bottom nav — cart button renders above in DOM order)

**Test requirements:**
- Cart floating button visually clears the bottom nav
- No overlap on any screen size
- Safe area inset still respected

**Integration notes:** Verify on restaurant menu pages where both cart float and bottom nav are visible.

**Demo:** Add item to cart on a restaurant page — cart float appears above the bottom nav, not overlapping.

---

## Step 10: Add portal switching to Account page

**Objective:** Let users with an organization switch to the owner portal from their account page.

**Implementation guidance:**
- Modify `src/features/customer-account/components/customer-account-page.tsx`
- Import `useTRPC` and `useQuery` to call `organization.mine()`
- If query succeeds (user has org): render a "Switch to Owner Portal" link/button
  - Use `<Link href="/organization">` for same-tab navigation
  - Place near top of account page or in a prominent section
  - Style: secondary button or a card-style link with `Building2` icon
- If query fails or returns no org: don't render anything
- Wrap the org query with appropriate error handling (no error UI, just hide the link)

**Test requirements:**
- User with organization sees "Switch to Owner Portal" link
- User without organization does not see the link
- Tapping link navigates to `/organization` in same tab
- Link not visible for unauthenticated users

**Integration notes:** Consider also adding a "Switch to Customer View" link in the owner sidebar (`src/app/(owner)/sidebar.tsx`) — this is the reverse direction.

**Demo:** Log in as an owner, navigate to Account tab — "Switch to Owner Portal" card/link visible. Tap → navigates to /organization.

---

## Step 11: Fix accessibility — landmarks, skip-link, nested `<main>`

**Objective:** Ensure proper HTML landmark structure and screen reader support.

**Implementation guidance:**
- This step is mostly covered by Steps 5-8 but needs a verification pass:
  - Confirm single `<main id="main-content">` in DOM (from shell only)
  - Confirm `<header>` wraps the header (already does in `CustomerHeader`)
  - Confirm `<nav aria-label="Main navigation">` wraps bottom nav
  - Confirm skip-to-content link is first focusable element
- Check all pages modified in Steps 6-8: no remaining `<main>` tags in page components
- Add `role` attributes if needed (shouldn't be — semantic HTML covers it)

**Test requirements:**
- Axe or Lighthouse accessibility audit passes with no landmark errors
- Single `<main>`, single `<header>`, single `<nav>` in DOM
- Skip-to-content link works (focus → Enter → focus moves to main content)
- No nested `<main>` anywhere

**Integration notes:** This is a verification/cleanup step. Most work was done in prior steps.

**Demo:** Run Lighthouse accessibility audit — no landmark violations. Tab through page — skip-link is first focusable element.

---

## Step 12: Replace hardcoded hex colors with design tokens

**Objective:** Swap `from-[#fff8f2]` to `from-peach` across all three account pages.

**Implementation guidance:**
- This should already be done in Step 6, but verify:
  - `saved-restaurants-page.tsx`: `from-peach` ✓
  - `customer-orders-page.tsx`: `from-peach` ✓
  - `customer-account-page.tsx`: `from-peach` ✓
- Search for any remaining hardcoded `#fff8f2` in the codebase
- Search for any other hardcoded hex values in customer-facing pages that should use tokens

**Test requirements:**
- No `#fff8f2` anywhere in `src/features/` or `src/app/(public)/`
- Gradient renders correctly with `from-peach`
- Visual regression check: peach gradient looks the same (or close enough) to `#fff8f2` in light mode

**Integration notes:** `--peach: oklch(0.95 0.03 65)` should be visually similar to `#fff8f2`. If not, adjust the token value rather than reverting to hex.

**Demo:** Open Orders, Saved, Account pages — gradient background is warm peach, no visual difference from before.
