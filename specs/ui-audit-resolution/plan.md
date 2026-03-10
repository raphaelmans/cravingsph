# Implementation Plan — UI Audit Resolution

## Checklist

- [ ] Step 1: Database migration — new tables and column additions
- [ ] Step 2: Storage infrastructure — buckets, upload utilities, seed script
- [ ] Step 3: Portal separation — profile.portal_preference enforcement
- [ ] Step 4: Discovery backend — featured, nearby, search, location filters
- [ ] Step 5: Saved restaurants — full backend integration
- [ ] Step 6: Order system — tables, router, customer + owner hooks
- [ ] Step 7: Reviews — create and display tied to real orders
- [ ] Step 8: Owner payment config — org-scoped persistence
- [ ] Step 9: Owner verification — real document uploads
- [ ] Step 10: Branch operating hours — backend persistence
- [ ] Step 11: Admin user access — persisted toggle
- [ ] Step 12: Onboarding wizard — honest completion state
- [ ] Step 13: Owner nav — fix dead links
- [ ] Step 14: Component fixes — breadcrumb, add-item dialog, image upload
- [ ] Step 15: QR scanner — browser camera implementation
- [ ] Step 16: Discovery UI — save-for-later, live cards
- [ ] Step 17: Seed data — Cebu City restaurants with lat/lng
- [ ] Step 18: E2E verification — Playwright tests for all 18 issues

---

## Step 1: Database Migration — New Tables and Column Additions

**Objective:** Create all new database tables and add columns to existing tables so every subsequent step has its data layer ready.

**Implementation guidance:**
- Create Drizzle schema files in `src/shared/infra/db/schema/` for: saved_restaurant, order, order_item, order_status_history, review, payment_method, verification_document, operating_hours
- Add `portal_preference` column to `profile.ts`
- Add `latitude` and `longitude` columns to `branch.ts`
- Export all new schemas from `src/shared/infra/db/schema/index.ts`
- Apply schema changes with `pnpm db:push` (drizzle-kit push) — this is the project's standard for syncing schema to Supabase
- Do NOT use `drizzle-kit generate` + `drizzle-kit migrate` — use `pnpm db:push` directly

**Test requirements:**
- `pnpm db:push` completes without errors
- All new tables appear in Supabase dashboard
- Existing data in profile, branch, and other tables is preserved
- Drizzle `db.query.*` works for each new table

**Integration notes:**
- This step has zero frontend impact — purely additive schema changes
- All subsequent steps depend on this `pnpm db:push` being applied first
- Always run `pnpm db:push` after any schema file changes throughout all subsequent steps

**Demo:** Run `pnpm db:push` → new tables visible in Supabase table editor.

---

## Step 2: Storage Infrastructure — Buckets, Upload Utilities, Seed Script

**Objective:** Set up Supabase Storage buckets and a reusable upload utility so file upload features (verification docs, menu images) have infrastructure ready.

**Implementation guidance:**
- Create `scripts/seed-storage-buckets.ts` following the next16bp pattern (idempotent bucket creation via raw SQL against `storage.buckets`)
- Define 5 buckets: menu-item-images (public), restaurant-assets (public), verification-docs (private), avatars (public), payment-proofs (private)
- Add `db:seed:buckets` script to package.json
- Create `src/shared/infra/supabase/storage.ts` — wrapper with `uploadFile(bucket, path, file)`, `deleteFile(bucket, path)`, `getPublicUrl(bucket, path)` functions
- Create `src/modules/storage/storage.service.ts` — validates file size/type, generates unique paths, delegates to storage wrapper

**Test requirements:**
- `pnpm db:seed:buckets` creates all 5 buckets (idempotent)
- Upload a test file to each bucket via the storage service
- Public buckets return accessible URLs
- Private buckets require signed URLs

**Integration notes:**
- Steps 9 (verification) and 14 (image upload) depend on this infrastructure
- No frontend changes yet

**Demo:** Run seed script, verify buckets in Supabase Storage dashboard.

---

## Step 3: Portal Separation — profile.portal_preference Enforcement

**Objective:** Enforce strict customer/owner portal separation so customer accounts cannot access owner workflows (Issue 008).

**Implementation guidance:**
- Update `src/shared/kernel/auth.ts` — add `portalPreference` to Session interface
- Update `src/shared/infra/supabase/session.ts` — load `portal_preference` from profile table when building session
- Update `src/modules/auth/auth.router.ts` register mutation — accept `portalPreference` param, set on profile creation
- Update `src/features/auth/components/register-form.tsx` — pass `portalPreference: 'customer'`
- Update `src/features/auth/components/owner-register-form.tsx` — pass `portalPreference: 'owner'`, remove localStorage org-name hack
- Update `src/app/(owner)/layout.tsx` — after `requireSession()`, check `session.portalPreference === 'owner'` (allow null for backward compat with existing org owners)
- Update `src/modules/organization/organization.router.ts` — check portal_preference before allowing `create`
- Update `src/app/(auth)/post-login/page.tsx` — use portal_preference for routing

**Test requirements:**
- Customer register → profile.portal_preference = 'customer'
- Owner register → profile.portal_preference = 'owner'
- Customer navigating to /organization/* → redirected to /
- Customer calling organization.create → FORBIDDEN error
- Existing accounts with null portal_preference + org → still work as owners (backward compat)
- Post-login routes correctly based on portal_preference

**Integration notes:**
- Depends on Step 1 (portal_preference column exists)
- Affects all owner pages and org mutations
- Backward compatible: null portal_preference with existing org treated as owner

**Demo:** Register as customer → manually navigate to /organization/get-started → redirected to /.

---

## Step 4: Discovery Backend — Featured, Nearby, Search, Location Filters

**Objective:** Replace all stub restaurant data on landing and search pages with live database queries (Issues 001, 002).

**Implementation guidance:**
- Create `src/modules/discovery/` module (router, service, repository, DTOs)
- `discovery.featured` — query restaurants WHERE is_featured=true AND is_active=true, JOIN branch for location data, JOIN to get first branch cover image
- `discovery.nearby` — accept optional lat/lng, ORDER BY Haversine distance if provided, fallback to all active restaurants
- `discovery.search` — accept query (name ILIKE), cuisine, city, province filters, return matching restaurants
- `discovery.locations` — SELECT DISTINCT city, province FROM branch WHERE restaurant is active, with counts
- Update `src/app/(public)/page.tsx` — replace FEATURED_RESTAURANTS and NEARBY_RESTAURANTS with tRPC calls, request browser geolocation
- Update `src/app/(public)/search/page.tsx` — replace ALL_RESTAURANTS with tRPC search, wire location filter to discovery.locations
- Update `src/features/discovery/components/location-filter.tsx` — replace hardcoded LOCATION_OPTIONS with dynamic data from discovery.locations

**Test requirements:**
- Landing page shows only published restaurants from the database
- Clicking a discovery card navigates to a valid /restaurant/{slug} page (no TRPCError)
- Search filters by query, cuisine, and location independently and combined
- Location dropdown shows only cities/provinces with actual restaurants
- With geolocation: nearby section sorts by proximity
- Without geolocation: nearby section shows all active restaurants

**Integration notes:**
- Depends on Step 1 (lat/lng on branch)
- Depends on Step 17 (seed data) for meaningful demo — but works with existing demo restaurant too
- Discovery cards reuse existing RestaurantPreview interface

**Demo:** Visit / → see live restaurants from DB. Search → filter by Cebu City → results narrow.

---

## Step 5: Saved Restaurants — Full Backend Integration

**Objective:** Replace localStorage-based saved restaurants with account-scoped backend persistence (Issues 004, 005).

**Implementation guidance:**
- Create `src/modules/saved-restaurant/` module (router, service, repository)
- Procedures: list, save, unsave, isSaved
- Rewrite `src/features/saved-restaurants/hooks/use-saved-restaurants.ts` to use tRPC queries/mutations
- Maintain the same hook return interface where possible for minimal component changes
- Update `src/features/saved-restaurants/components/saved-restaurants-page.tsx` to handle loading/empty states from tRPC
- Add save/unsave button to `src/features/discovery/components/restaurant-card.tsx`
- Guest save attempt → redirect to /login?redirect={currentPath}

**Test requirements:**
- New account → /saved shows empty state
- Save a restaurant → appears on /saved
- Unsave → removed from /saved
- Save persists across logout/login
- Save state visible on discovery cards
- Guest tapping save → redirected to login

**Integration notes:**
- Depends on Step 1 (saved_restaurant table)
- Discovery card changes also deliver Issue 004 (save-for-later affordance)

**Demo:** Login → visit / → save restaurant via heart icon → visit /saved → restaurant appears. Logout, login again → still there.

---

## Step 6: Order System — Tables, Router, Customer + Owner Hooks

**Objective:** Build the full order lifecycle backend and replace both customer order history and owner order management hooks (Issues 006, 007, 011).

**Implementation guidance:**
- Create `src/modules/order/` module (router, service, repository, DTOs, errors)
- Order number generation: sequential with "ORD-" prefix
- Customer procedures: create, listMine, getDetail, reorder
- Owner procedures: listByBranch, accept, reject, updateStatus, confirmPayment, rejectPayment, getTimeline
- Status transitions validated in service (e.g., can't go from "placed" to "ready")
- Every status change creates an order_status_history record
- Rewrite `src/features/orders/hooks/use-customer-orders.ts` — tRPC queries/mutations
- Rewrite `src/features/order-management/hooks/use-order-management.ts` — tRPC queries/mutations
- Reorder validation: check restaurant and menu items still exist and are available before adding to cart

**Test requirements:**
- New customer → /orders shows empty state (zero orders, zero spend)
- Place order → appears in customer /orders and owner branch orders
- Owner accept/reject → status updates, timeline records created
- Full lifecycle: placed → accepted → preparing → ready → completed
- Reorder against valid restaurant → items added to cart, navigates to working page
- Reorder against deleted restaurant → user-friendly error, stays on /orders
- Branch with no orders → owner sees empty state (not seeded data)

**Integration notes:**
- Depends on Step 1 (order, order_item, order_status_history tables)
- This is the largest step — consider splitting into customer-side and owner-side sub-tasks
- Payment proof upload depends on Step 2 (storage infrastructure)

**Demo:** Customer places order → appears in owner dashboard → owner accepts → customer sees "Preparing" → owner marks ready → completed.

---

## Step 7: Reviews — Create and Display Tied to Real Orders

**Objective:** Replace seeded reviews with account-backed review system (part of Issues 006, 007).

**Implementation guidance:**
- Create `src/modules/review/` module (router, service, repository)
- `review.create` — requires valid orderId owned by the customer, one review per order
- `review.listByRestaurant` — public, returns reviews for display on restaurant page
- Update `src/features/orders/hooks/use-customer-orders.ts` — integrate review status (which orders have been reviewed)
- Update restaurant detail page — show real reviews from review.listByRestaurant

**Test requirements:**
- Customer can review a completed order
- Cannot review same order twice
- Cannot review another user's order
- Reviews appear on the restaurant public page
- New restaurant with no reviews shows empty state

**Integration notes:**
- Depends on Step 1 (review table) and Step 6 (order system)
- Reviews display on both customer orders page and public restaurant page

**Demo:** Complete an order → submit review → review appears on restaurant page.

---

## Step 8: Owner Payment Config — Org-Scoped Persistence

**Objective:** Replace seeded payment methods with organization-backed persistence (Issue 012).

**Implementation guidance:**
- Create `src/modules/payment-config/` module (router, service, repository)
- Procedures: list, add, update, remove, setDefault, has (boolean for onboarding)
- Authorization: verify org ownership before all mutations
- Rewrite `src/features/payment-config/hooks/use-payment-config.ts` to use tRPC
- Bank type requires bankName field — validate in DTO

**Test requirements:**
- New organization → /organization/payments shows empty state (zero methods)
- Add GCash method → persists across refresh
- Set default → reflected on reload
- Remove method → gone
- paymentConfig.has returns true only when ≥1 active method exists

**Integration notes:**
- Depends on Step 1 (payment_method table)
- paymentConfig.has feeds into Step 12 (onboarding status)

**Demo:** New org → payments empty → add GCash → refresh → GCash still there.

---

## Step 9: Owner Verification — Real Document Uploads

**Objective:** Replace seeded verification state with real Supabase Storage uploads and backend persistence (Issue 013).

**Implementation guidance:**
- Create `src/modules/verification/` module (router, service, repository)
- Upload flow: client uploads to Supabase Storage `verification-docs` bucket → sends fileUrl + metadata to verification.uploadDocument procedure
- Procedures: getRestaurantStatus, uploadDocument, removeDocument, submit, isSubmitted
- Rewrite `src/features/verification/hooks/use-owner-verification.ts` — fully tRPC backed
- Update verification UI to use real file upload (connect file input to Supabase Storage)
- New restaurant starts in "draft" with 0/3 documents

**Test requirements:**
- New restaurant → verification page shows "Draft", 0 of 3 documents
- Upload a document → file in Supabase Storage, record in DB
- Remove document → file deleted, record removed
- Submit with 3 docs → status changes to "under_review"
- Cannot submit with <3 documents
- isSubmitted returns true only after successful submission

**Integration notes:**
- Depends on Step 1 (verification_document table) and Step 2 (storage buckets)
- verification.isSubmitted feeds into Step 12 (onboarding status)

**Demo:** New restaurant → upload 3 docs → submit → status shows "Under Review".

---

## Step 10: Branch Operating Hours — Backend Persistence

**Objective:** Persist operating hours to the database instead of client-only store (Issue 014).

**Implementation guidance:**
- Add procedures to branch router: getOperatingHours, updateOperatingHours
- updateOperatingHours accepts array of 7 day entries, upserts all in transaction
- Rewrite weekly hours section of `src/features/branch-settings/hooks/use-branch-settings.ts` — load from tRPC, save to tRPC
- Remove the "stored locally for now" copy from the UI
- Keep template features (apply weekday template, reset) — compute on client, persist via mutation

**Test requirements:**
- New branch → default hours (or empty state)
- Set Monday 9:00-21:00 → refresh → still 9:00-21:00
- Apply weekday template → all weekdays updated
- Mark Sunday as closed → persists

**Integration notes:**
- Depends on Step 1 (operating_hours table)
- No other steps depend on this

**Demo:** Edit Monday hours → refresh page → hours persist.

---

## Step 11: Admin User Access — Persisted Toggle

**Objective:** Replace local-only admin user access toggle with backend persistence (Issue 016).

**Implementation guidance:**
- Add `admin.setUserActive` procedure to admin router
- Implementation: update a user status field or use Supabase Auth admin API to disable/enable user
- Rewrite access toggle in `src/features/admin/hooks/use-admin-users.ts` — call mutation instead of local store
- Remove "local scaffold" label from admin user management page

**Test requirements:**
- Admin deactivates user → refresh → user still deactivated
- Admin reactivates user → refresh → user active again
- Deactivated user cannot log in (if using Supabase Auth disable)

**Integration notes:**
- Depends on Step 1 (migration applied)
- May need Supabase admin API key for user management

**Demo:** Admin deactivates user → refresh → status persists.

---

## Step 12: Onboarding Wizard — Honest Completion State

**Objective:** Fix the wizard to not declare setup complete while required steps remain incomplete (Issue 010).

**Implementation guidance:**
- Rewrite `src/features/onboarding/hooks/use-onboarding-status.ts` — replace hardcoded false for steps 4-6 with real queries:
  - Step 4 (Menu): `menu.hasContent({ branchId })` — true if ≥1 menu item exists
  - Step 5 (Payments): `paymentConfig.has()` — true if ≥1 active method
  - Step 6 (Verification): `verification.isSubmitted({ restaurantId })` — true if submitted
- Update onboarding wizard completion step: only show "You're All Set!" when all 7 steps are complete
- If skipped steps remain, show "Partial Setup Complete" with a summary of what's left
- Keep hub and wizard driven from the same source of truth (useOnboardingStatus hook)

**Test requirements:**
- Complete steps 1-3, skip 4-6 → wizard says "Partial Setup" not "All Set"
- Hub shows 3/7 (consistent with wizard)
- Complete all 7 → wizard says "You're All Set!", hub shows 7/7
- Adding a menu item → step 4 becomes complete dynamically

**Integration notes:**
- Depends on Steps 6 (menu.hasContent), 8 (paymentConfig.has), 9 (verification.isSubmitted)
- This step ties together multiple backends into a single status view

**Demo:** Skip steps 4-6 → wizard shows partial → add a menu item → step 4 turns green.

---

## Step 13: Owner Nav — Fix Dead Links

**Objective:** Remove or create missing owner routes so no sidebar link 404s (Issue 009).

**Implementation guidance:**
- Create route pages for: `/organization/orders`, `/organization/team`, `/organization/settings`
- `/organization/orders` — redirect to branch-specific orders or show a branch selector
- `/organization/team` — placeholder page with "Team management coming soon" and proper layout
- `/organization/settings` — placeholder page with link to branch settings
- Fix `/organization/profile` → point to `/account/profile` (existing route)
- Update sidebar links to match actual routes
- Mark placeholder pages clearly so they're not mistaken for complete features

**Test requirements:**
- Every sidebar link navigates to a real page (no 404)
- Profile link goes to /account/profile
- Placeholder pages render within the owner shell

**Integration notes:**
- No backend dependencies — purely routing and UI
- Can be done in parallel with other steps

**Demo:** Click every sidebar link → all render, no 404s.

---

## Step 14: Component Fixes — Breadcrumb, Add-Item Dialog, Image Upload

**Objective:** Fix breadcrumb hydration errors, add-item dialog validation, and replace URL input with file upload (Issues 015, 017, 018).

**Implementation guidance:**

**Breadcrumb (Issue 015):**
- In `src/components/ui/breadcrumb.tsx`, change `BreadcrumbSeparator` to render `<span>` instead of `<li>`
- Or restructure `src/components/layout/dashboard-navbar.tsx` to render separators as siblings

**Add-Item Dialog (Issue 017):**
- In `src/features/menu-management/components/add-item-dialog.tsx`:
  - Accept categories list as prop, preselect sole category or first category
  - Fix imageUrl: transform empty string to undefined before Zod validation, or update schema to `.or(z.literal(""))`
- In `src/modules/menu/dtos/menu.dto.ts`: update imageUrl to handle empty string gracefully

**Image Upload (Issue 018):**
- Replace the imageUrl text input in add-item dialog with a file upload component
- Upload to `menu-item-images` Supabase Storage bucket
- Store the returned public URL in menu_item.image_url
- Add preview thumbnail after upload
- Remove the text URL input entirely

**Test requirements:**
- Zero hydration errors on all owner pages (breadcrumb)
- Add item with one category → category pre-selected
- Add item without image → no validation error
- Add item with uploaded image → image displays on menu page
- No "hostname not configured" errors anywhere

**Integration notes:**
- Breadcrumb fix is independent — do first
- Image upload depends on Step 2 (storage buckets)
- Dialog fixes are independent of backend

**Demo:** Open any owner page → zero console errors. Add item → category pre-selected, image upload works.

---

## Step 15: QR Scanner — Browser Camera Implementation

**Objective:** Replace the placeholder "coming soon" toast with a working QR scanner (Issue 003).

**Implementation guidance:**
- Install `html5-qrcode` package
- Create `src/features/discovery/components/qr-scanner-modal.tsx`:
  - Modal dialog triggered from scan CTA
  - Request camera permission
  - Scan for QR codes containing restaurant slugs (format: `cravings://{slug}` or just the slug)
  - On successful scan → close modal → navigate to `/restaurant/{slug}`
  - Handle camera denied → show message with instructions
  - Close button to dismiss
- Update `src/features/discovery/components/scan-qr-cta.tsx` — open modal instead of toast

**Test requirements:**
- Tapping "Scan cravings QR" opens the scanner modal
- Valid QR code → navigates to correct restaurant page
- Invalid QR → shows error message in modal
- Camera denied → user-friendly message
- Close button dismisses modal

**Integration notes:**
- Independent of backend steps
- QR code format should be documented for restaurant owners to generate codes

**Demo:** Tap scan → camera opens → scan QR → lands on restaurant page.

---

## Step 16: Discovery UI — Save-for-Later, Live Cards

**Objective:** Polish discovery cards with save affordances and ensure all cards link to working pages (Issues 004, 001 frontend).

**Implementation guidance:**
- Update `src/features/discovery/components/restaurant-card.tsx`:
  - Add heart/bookmark icon button for save/unsave
  - Check isSaved state from useSavedRestaurants hook
  - Guest users → save triggers redirect to /login?redirect={currentPath}
  - Optimistic UI for save/unsave toggle
- Apply frontend-design, copywriting, product-designer, ui-ux-pro-max skills:
  - Empty state designs for /saved, /orders, owner payments, owner orders, verification
  - Discovery card hover states and save animations
  - Error state copy improvements
  - Loading skeleton states for tRPC queries

**Test requirements:**
- Every card on / links to a working restaurant page
- Save button visible on all discovery cards
- Save toggle works with optimistic update
- Empty states are designed, not just text

**Integration notes:**
- Depends on Step 4 (live discovery data) and Step 5 (saved restaurants backend)
- This is the polish step for customer-facing discovery

**Demo:** Browse / → cards show real restaurants → save one → heart fills → visit /saved → it's there.

---

## Step 17: Seed Data — Cebu City Restaurants with Lat/Lng

**Objective:** Create realistic Cebu City restaurant fixtures for development and testing (from R8).

**Implementation guidance:**
- Create 4 new fixture files in `scripts/seed-data/`:
  - `cebu-lechon-house.ts` — Cebu lechon, Cebu City (lat: 10.3157, lng: 123.8854)
  - `sugbo-mercado-grill.ts` — grilled seafood, Mandaue (lat: 10.3236, lng: 123.9223)
  - `cafe-cebuano.ts` — coffee and pastries, IT Park (lat: 10.3303, lng: 123.9058)
  - `pochero-de-cebu.ts` — Cebuano soup, Talisay (lat: 10.2447, lng: 123.8494)
- Each fixture: 4-6 categories, 3-5 items per category, variants and modifiers, lat/lng on branch
- Mark 2 restaurants as `is_featured: true` via a post-seed SQL update or add featured flag to DemoSeed type
- Update `scripts/seed-demo-restaurant.ts` to iterate over an array of fixtures
- Update the DemoSeed type to include optional `latitude`, `longitude`, and `isFeatured` fields
- Add `db:seed:all` script that runs buckets + all restaurant fixtures

**Test requirements:**
- `pnpm db:seed:all` creates all restaurants without errors
- Idempotent: running twice doesn't duplicate data
- Discovery page shows Cebu City restaurants
- Location filter shows Cebu City, Mandaue, Talisay
- Geolocation sorting works with the lat/lng values

**Integration notes:**
- Depends on Step 1 (lat/lng columns on branch)
- Should run after Steps 1 and 2 (migration + buckets)
- Provides the data for E2E testing in Step 18

**Demo:** Run seed → visit / → see Cebu City restaurants → search by Cebu City → results filter correctly.

---

## Step 18: E2E Verification — Playwright Tests for All 18 Issues

**Objective:** Verify every issue is resolved with automated Playwright tests running against the seeded local environment.

**Implementation guidance:**
- Use playwright-cli skill for browser automation
- Create test scenarios matching each acceptance criteria (AC-001 through AC-018)
- Tests run against `http://localhost:3000/` with seeded Cebu City data
- Key test flows:
  1. Discovery: / shows live restaurants, cards link to working pages
  2. Search: filter by city, cuisine, query — results update
  3. QR: scan flow (may need mocked QR input)
  4. Save: authenticated save/unsave, guest redirect
  5. Saved: new account sees empty state
  6. Orders: new account sees empty state
  7. Reorder: works against valid restaurant
  8. Portal: customer cannot access owner routes
  9. Owner nav: all links resolve
  10. Onboarding: skip steps → honest completion
  11. Branch orders: new branch shows empty
  12. Payments: new org shows empty
  13. Verification: new restaurant shows draft
  14. Operating hours: persist across refresh
  15. Breadcrumb: zero hydration errors in console
  16. Admin: toggle persists
  17. Add item: defaults work, no validation errors
  18. Images: no hostname crashes

**Test requirements:**
- All 18 test scenarios pass
- Zero console hydration errors on owner pages
- Zero TRPCError: Restaurant not found on discovery click-through

**Integration notes:**
- Depends on ALL previous steps
- This is the final verification gate
- Run with `playwright-cli` skill for detailed browser interaction

**Demo:** Full Playwright test suite passes — every issue verified resolved.
