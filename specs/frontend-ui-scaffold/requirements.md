# Requirements — Frontend UI Scaffold

## Q&A Record

*(Questions and answers will be recorded below as requirements are clarified.)*

---

### Q1: Phasing Scope

The PRD defines 7 delivery phases:

| Phase | Scope |
|-------|-------|
| 1 | Menu browsing + cart (customer) |
| 2 | Restaurant onboarding + menu management (owner) |
| 3 | Ordering + checkout (customer + owner) |
| 4 | Order management dashboard (owner) |
| 5 | Payments (manual/offline) |
| 6 | Discovery + home page |
| 7 | Retention (history, reorder, reviews, notifications, favorites) |

Are we scaffolding frontend components and page wirings for **all 7 phases** upfront, or focusing on a specific subset first (e.g., Phases 1-5 which form the core ordering loop)?

**A1:** All 7 phases. We're scaffolding the complete frontend upfront — all pages, components, and wirings across customer, owner, and admin portals.

---

### Q2: Route Structure for Portals

The PRD has 3 portals: Customer, Restaurant Owner, and Admin. The current codebase has `(auth)` and `(protected)` route groups. How should we organize the top-level routes?

**Option A** (URL-separated):
```
/                          → Customer home/discovery
/restaurant/[slug]         → Customer menu browsing
/checkout                  → Customer checkout
/orders/[id]               → Customer order tracking
/dashboard/...             → Owner portal (all owner pages)
/admin/...                 → Admin portal (all admin pages)
```

**Option B** (subdomain-separated): `app.cravings.ph` for owners, `admin.cravings.ph` for admins, `cravings.ph` for customers

**Option C** — you have a different preference?

The legacy used `/restaurant/[slug]` for customer menu pages, which we're keeping. The question is mainly about owner and admin routing.

**A2:** Follow the reference repo (next16bp / KudosCourts) pattern. Use Next.js route groups for portal separation:

- `(public)` — Customer-facing pages (discovery, restaurant menus, browsing). No auth required.
- `(auth)` — Smart route-type router for login/register + protected player-like routes. Uses pathname detection to apply appropriate guard and shell.
- `(owner)` — Restaurant owner portal. Server-side org validation, redirects to get-started if no org. Uses `DashboardShell` with owner sidebar.
- `(admin)` — Admin portal. Role-guarded (`requireAdminSession()`), `DashboardShell` with admin sidebar.

Key patterns from reference:
- Portal switching via dropdown + cookie persistence
- Permission-based nav filtering
- Server-side org gate in owner layout
- Portal-neutral routes (account pages) preserve context via cookie
- Route type classification system (`public | guest | protected | organization | admin`)

---

### Q3: Customer Menu Browsing — Category Navigation Style

The legacy uses a **dropdown select** (Radix Select) for category navigation. The PRD and Figma reference a **horizontal-scroll category nav with sticky header** (pill-shaped tabs). The design system analysis mentions both:

- **Legacy:** Dropdown menu — compact, works with many categories, but less visual
- **Figma/PRD:** Horizontal scroll tabs — more discoverable, matches modern food apps (Grab, FoodPanda), stickier UX

Which approach should we use for the new build?

**A3:** Horizontal-scroll pill tabs (Figma intent). Sticky header, category pills that scroll horizontally, active state in orange. Matches modern food-app UX (Grab, FoodPanda). This is an improvement over the legacy dropdown.

---

### Q4: Checkout Flow — Guest vs Authenticated

The PRD says:
- Dine-in orders: no account required (fully anonymous)
- Pickup orders: guest checkout with name + phone number
- Optional account creation for order history, reorder, favorites

For the checkout UI, should we:

**Option A:** Single checkout page that adapts — dine-in shows minimal fields (table number), pickup shows name + phone, with an optional "Create account to track your order" prompt at the end.

**Option B:** Separate flows — dine-in is a quick bottom-sheet confirmation, pickup is a full checkout page with form fields.

**Option C:** Your preference?

**A4:** Option A — Single adaptive checkout page. Dine-in shows table number field, pickup shows name + phone. Optional "Create account to track your order" prompt at the end. Keeps the flow unified and simple.

---

### Q5: Owner Sidebar Navigation

Following the reference repo pattern, the owner sidebar needs navigation items mapped to CravingsPH features. Based on the PRD, the owner portal needs:

- Dashboard (home/overview)
- Get Started (onboarding wizard/hub)
- Restaurants & Branches (hierarchy management)
- Menu Management (categories, items, variants, modifiers)
- Orders (inbox/active/completed/cancelled tabs)
- Payments (payment method config, verification queue)
- Team (invite, roles, permissions)
- Settings (operating hours, order acceptance mode, QR codes)

Should the sidebar mirror the reference repo's **collapsible hierarchy** pattern (e.g., Restaurant → Branch A → Menu, Branch B → Menu) or use a **flat nav with a branch selector** at the top (like picking which branch you're managing)?

**A5:** Hybrid approach for the sidebar itself (org selector in header, collapsible Restaurant → Branch hierarchy via SidebarMenuSub, flat nav for Dashboard/Orders/Payments/Team/Settings). BUT with a critical distinction — see Q6.

---

### Q6: Strict Portal Separation

User and Organization portals are **strictly separated** — no portal switching. A customer account cannot navigate to org features. An org account CAN view the customer experience (to preview their restaurant), but not the other way around.

This means:
- **No portal tabs/dropdown switcher** (unlike the reference repo's PortalTabsSidebar)
- Registration determines your portal: register as customer → customer forever; register as owner → owner portal + can preview customer view
- Separate route groups with hard auth guards — `(public)` for customer, `(owner)` for org, `(admin)` for admin
- No shared authenticated dashboard between customer and owner

**Clarification needed:** When an org owner wants to "preview as customer," is that:
- **(a)** A dedicated "Preview" button within the owner dashboard that opens the public restaurant page (same as any customer would see via QR)?
- **(b)** A full portal switch where they browse as a customer with their own cart/ordering?

**A6:** Option (a) — "Preview" button in the owner dashboard that opens the public restaurant page in a new tab. No portal switching, no dual identity. Owner sees exactly what customers see via the public URL.

---

### Q7: Customer Authenticated Experience

With strict portal separation, the PRD still mentions optional customer accounts for order history, reorder, favorites, and reviews (Phase 7 — Retention). How should authenticated customers work?

- Customers browse and order **without** an account (guest checkout)
- Optionally they can create a **customer account** (separate from owner registration)
- A customer account unlocks: order history, reorder, saved restaurants, reviews

Where do these authenticated customer pages live? Options:

**(a)** Under the `(public)` route group with conditional auth — pages like `/orders`, `/saved`, `/account` are public routes that check for a session and redirect to login if needed. No separate layout, just the same customer mobile shell.

**(b)** A separate `(customer)` route group with its own auth guard and a minimal customer nav (profile, orders, saved).

**A7:** Option (a) — Keep authenticated customer pages under `(public)` with conditional auth checks. Same mobile customer shell. Pages like `/orders`, `/saved`, `/account` just check for session and redirect to login if needed. No separate route group.

---

### Q8: Mobile vs Desktop Strategy

The legacy was mobile-only (showed "Coming Soon" on desktop). The PRD says "mobile-first, responsive desktop support." The Figma has both mobile customer screens AND a desktop admin layout.

How should we handle this:

**(a)** Customer portal: **mobile-first responsive** — works on desktop too (wider layout, maybe 2-column for menu items) but designed for mobile. Owner/Admin portal: **desktop-first** with sidebar layout (responsive down to tablet, but primary use is desktop).

**(b)** Customer portal: **mobile-only** like legacy (hide on desktop, show "Coming Soon"). Owner/Admin: desktop-first.

**(c)** Everything responsive across all breakpoints.

**A8:** Option (a), mobile-first. Customer portal: mobile-first responsive (works on desktop with wider layout). Owner/Admin portal: desktop-first with sidebar layout, responsive down to tablet.

---

### Q9: Bottom Sheet vs Drawer vs Page Navigation

The legacy uses bottom sheets (Radix Sheet side="bottom") heavily — item customization, cart view, search, bill editing. The PRD adds new flows (checkout, payment proof upload, order tracking) that need UI surfaces.

For the new flows, should we:

**(a)** Stay consistent with legacy — use bottom sheets/drawers for everything on mobile (item customization, cart, checkout, payment). Full pages only for order tracking and discovery.

**(b)** Bottom sheets for quick interactions (item customization, search), but full pages for multi-step flows (checkout, payment proof, order tracking).

**A9:** Option (a) — Bottom sheets/drawers for everything on mobile, consistent with legacy. Item customization, cart, checkout, payment proof upload all in bottom sheets. Full pages only for discovery/home, order tracking, and restaurant browsing.

---

### Q10: Owner Onboarding — Wizard vs Hub

The PRD describes both a **linear wizard** (7 steps) and a **hub view** (non-linear card grid) for restaurant onboarding, matching the reference repo's dual-mode pattern. The reference repo has both `/organization/onboarding` (wizard) and `/organization/get-started` (hub).

Should we implement:

**(a)** Both — wizard for first-time setup, hub as the default landing after first visit (exactly like the reference repo).

**(b)** Hub only — simpler, lets owners jump to any task. Skip the linear wizard.

**(c)** Wizard only — guided experience, ensure owners complete all steps.

**A10:** Option (a) — Both. Wizard for first-time setup, hub as default landing after first visit. Matches the reference repo pattern exactly.

---

### Q11: Bill Splitting

The Figma has ~20 screens for bill splitting (add people, assign items, per-person totals). The PRD lists it as "out of scope."

Should we:

**(a)** Scaffold the pages/components for bill splitting now (empty shells with route wirings) so it's ready for future implementation.

**(b)** Skip entirely — don't create any bill splitting routes or components in this scaffold.

**A11:** Option (b) — Skip bill splitting entirely. Not in this scaffold.
