# Requirements — Customer Portal Navigation

Questions and answers recorded during requirements clarification.

---

## Q1: Scope — single effort or phased?

The README suggests implementing 001 → 002 → 003 sequentially (they're coupled), with 005–007 in parallel. Issue 004 (portal switching) is somewhat independent.

Should we treat all 7 issues as a single design/plan, or split them into separate specs? For example:
- **Option A:** One unified spec covering all 7 — single bottom nav + header + cleanup pass
- **Option B:** Phase 1 = navigation core (001, 002, 003, 006), Phase 2 = polish & extras (004, 005, 007)

**A:** Option A — one unified spec covering all 7 issues.

---

## Q2: Bottom nav tab structure

The issues suggest a bottom nav with: **Home, Orders, Saved, Account** + a center **QR scan FAB**. That's a 4-tab + FAB layout (like Grab, foodpanda, etc.).

Are you happy with those 4 tabs + center FAB, or do you want a different arrangement? For example:
- Should **Search** get its own tab instead of living in the Home hero?
- Any other tab you'd want (e.g., Promos, Notifications)?

**A:** Confirmed — 4 tabs (Home, Orders, Saved, Account) + center QR scan FAB. Search stays in the Home hero.

---

## Q3: Header behavior on subpages

When a user navigates to a subpage (e.g., a restaurant detail page, order detail, search results), should the persistent header:
- **Option A:** Stay as-is (logo + cart + auth icon) — subpages just scroll under it
- **Option B:** Transform into a contextual header (back arrow + page title) replacing the logo, while the bottom nav stays persistent
- **Option C:** Header hides on subpages, replaced by a contextual back-arrow header; bottom nav stays

This affects how we handle the ad-hoc headers from issue 003.

**A:** Option B — contextual header (back arrow + page title) on subpages. Bottom nav hides on deep subpages (restaurant detail, checkout) following industry standard (Grab, foodpanda, Uber Eats pattern).

---

## Q4: Unauthenticated user experience

When a guest (not signed in) taps a protected tab like Orders, Saved, or Account, should the app:
- **Option A:** Navigate to the page and let the existing proxy redirect to `/login?redirect=<target>` (current auth plumbing)
- **Option B:** Show an inline prompt/modal on the tab ("Sign in to view your orders") without navigating away
- **Option C:** Visually disable protected tabs for guests, with a "Sign in" badge

**A:** Option A — let the existing proxy redirect handle it. Navigate to the page, proxy redirects to `/login?redirect=<target>`.

---

## Q5: Portal switching — where and how?

For users with both customer and owner roles (issue 004), where should the portal switch live?
- **Option A:** In the Account tab page — a "Switch to Owner Portal" link/button
- **Option B:** In the header — a subtle role indicator/toggle always visible
- **Option C:** Both — Account page has the link, plus a small icon in the header for quick access

And should the switch be a same-tab navigation or open the owner portal in a new tab?

**A:** Option A — "Switch to Owner Portal" link in the Account page only. Only visible for users who belong to an organization. Same-tab navigation.

---

## Q6: Touch target strategy

For fixing undersized touch targets (issue 005), two approaches:
- **Option A:** Increase the visual size of buttons to 44px (simpler, but changes the look)
- **Option B:** Keep visual size at 32px but extend the invisible hit area to 44px with padding/pseudo-elements (preserves current visual design)

The quantity picker (+/-) during ordering is the highest-friction target. Should that one be visually larger regardless?

**A:** Default to shadcn/ui sizing variations. Use the existing component size variants (e.g., `size="lg"` on buttons) rather than custom sizing. Let shadcn's built-in sizes handle touch target compliance.

---

## Q7: Bottom nav visibility on restaurant pages

You confirmed the bottom nav hides on deep subpages. Let's clarify which pages count as "deep":
- Restaurant detail / menu page → hide bottom nav?
- Order detail page → hide bottom nav?
- Search results page → hide bottom nav?
- Checkout flow → hide bottom nav?

Or simpler: should bottom nav only show on the 4 tab root pages (Home, Orders, Saved, Account)?

**A:** Bottom nav stays visible on ALL pages — always persistent. This is a mobile-first app; the bottom nav is the primary navigation and should never disappear. (Revises earlier Q3 answer — bottom nav is always visible, only the header transforms on subpages.)

---

## Q8: Dark mode — current state and priority

Issue 007 flags hardcoded `#fff8f2` breaking dark mode. Is dark mode currently shipped/toggleable by users, or is it a future concern? This affects whether we:
- Just swap to tokens now (quick fix, dark mode works when eventually enabled)
- Need to verify the full navigation system looks correct in dark mode as part of this spec

**A:** Light mode only for now — theme is forced to light. Still swap hardcoded hex to design tokens for correctness, but no need to verify dark mode appearance. Dark mode is a future concern.

---

## Q9: Cart icon behavior

The `CustomerHeader` has a cart icon. When the bottom nav is added, should the cart icon:
- **Option A:** Stay in the header (top-right, like Grab/foodpanda)
- **Option B:** Move to the bottom nav as a 5th tab
- **Option C:** Only appear as a floating element on restaurant/menu pages where ordering happens

**A:** Option A — cart stays in the header (top-right). Standard food app placement.

---

## Q10: Back navigation behavior on subpages

When the contextual header shows a back arrow on subpages, should it:
- **Option A:** Use `router.back()` (browser history — goes to wherever the user came from)
- **Option B:** Navigate to a predictable parent (e.g., order detail → orders list, restaurant → home)

Option A is more flexible but can be surprising (e.g., user arrived via deep link, back goes to an external page). Option B is predictable but may not match the user's mental model if they navigated a non-standard path.

**A:** Option A — `router.back()`. Use browser history for back navigation.

---

*Requirements clarification complete.*
