# Requirements — UI Audit Resolution

Q&A record for refining the resolution approach.

---

## Q1: Backend readiness — which issues should get real backend integration vs. graceful scaffold state?

Many issues (005, 006, 011, 012, 013, 014, 016) require replacing local/seeded stores with real backend-persisted data. This is the biggest architectural decision:

- **Option A: Full backend integration** — Build real Supabase tables, tRPC procedures, and mutations for saved restaurants, order history, payment config, verification, branch settings, and admin user access. Production-correct but high effort.
- **Option B: Honest scaffolding** — Remove fake seed data, show proper empty states, and clearly label features as "coming soon" until backend is ready. Lower effort, still removes the broken/misleading behavior.
- **Option C: Hybrid** — Full backend for critical customer flows (discovery, saved, orders) and honest scaffolding for owner/admin features that aren't customer-facing yet.

**A1:** Full backend integration. All issues get real Supabase tables, tRPC procedures, and mutations. No more local stores or seed data in authenticated flows.

---

## Q2: Portal separation enforcement (Issue 008) — how should customer-vs-owner identity work?

Issue 008 is a security concern: any customer can navigate to `/organization/get-started` and create an organization. The spec says "strict portal separation." Options:

- **Option A: Role-based** — Add a `role` column to the user table (`customer` | `owner` | `admin`). Owner registration sets `role = owner`. Owner layout and org mutations check for `role = owner`. Customers get redirected.
- **Option B: Entitlement-based** — Add a `portal_access` or `is_owner` flag. Any user can be upgraded to owner through an explicit flow. More flexible for future "become an owner" features.
- **Option C: Separate registration flows only** — Keep a single user model but enforce that owner onboarding routes check for organization membership created through the owner registration path. Lighter touch.

**A2:** Role-based, but via a `portal_preference` enum column on the `profile` table (not `user_roles`, which is platform-level). Values: `customer` | `owner`. Owner registration sets `portal_preference = 'owner'`. Owner layout and org mutations check this column. Customers navigating to owner routes get redirected.

---

## Q3: QR scanning (Issue 003) — what should the MVP implementation be?

The scan QR CTA is prominent on the landing page but currently a placeholder. Options:

- **Option A: Browser camera scanner** — Use a JS QR library (e.g., `html5-qrcode`) to scan via device camera. Works on mobile web without native app.
- **Option B: Manual code entry** — Replace the scan button with a text input where users paste or type a restaurant/table code. Simpler, no camera permissions needed.
- **Option C: Both** — Camera scanner as primary with manual entry as fallback for desktop or denied camera access.

**A3:** Browser camera scanner using a JS QR library. No manual entry fallback for now.

---

## Q4: Discovery data source (Issue 001) — where do featured/nearby restaurants come from?

The landing page needs live restaurant data instead of hardcoded stubs. Options:

- **Option A: Single tRPC query** — One `discovery.featured` and one `discovery.nearby` procedure that query published restaurants from the database. "Nearby" is just a label for now (no geolocation), returning all published restaurants.
- **Option B: Geolocation-aware** — Use browser geolocation API + PostGIS or lat/lng columns on branches to return actually nearby restaurants. Featured is editorially curated (a flag on the restaurant).
- **Option C: Simple published list** — No featured/nearby distinction. Just show all published, verified restaurants in one grid. Simplest path.

**A4:** Geolocation-aware (Option B). Add lat/lng columns on branches, use browser geolocation for proximity sorting. Featured is editorially curated via a flag on the restaurant. Focus on Cebu City for seed data. Create additional seed data files in `scripts/seed-data/` following the same `DemoSeed` pattern as `demo-restaurant.ts`, and update the seed runner to handle multiple restaurants.

---

## Q5: Location filter source (Issue 002) — what geographic data model should back the search filters?

The search page needs real location filtering. Given that we're adding lat/lng to branches and focusing on Cebu City:

- **Option A: Branch-derived** — Extract unique city/province values from published branches. Filter options are dynamic, always reflecting what's actually available on the platform.
- **Option B: Predefined regions** — Maintain a curated list of supported cities/provinces (starting with Cebu City, Mandaue, Lapu-Lapu, Talisay, etc.). More controlled, but needs manual updates as coverage grows.
- **Option C: Hierarchical (Province → City → Barangay)** — Full Philippine geographic hierarchy. Most complete but heaviest to build.

**A5:** Branch-derived (Option A). Extract unique city/province values from published branches dynamically. Filter options always reflect real platform coverage. No manual curation needed.

---

## Q6: Saved restaurants & order history backend (Issues 005, 006, 007) — what tables are needed?

These features need real backend persistence. The schema currently has no tables for:
- Customer saved/bookmarked restaurants
- Customer orders and order items

Should saved restaurants and order history share the existing schema patterns, or do you have specific data model preferences?

- **Option A: Minimal tables** — `saved_restaurant` (userId, restaurantId, savedAt) and `order` + `order_item` tables with standard fields (status, total, items, timestamps). Keep it simple.
- **Option B: Rich order model** — Include order status history, delivery tracking fields, payment reference, review/rating on the order. Builds toward the full PRD retention stories.

**A6:** Rich order model (Option B). Full tables for saved_restaurant, order, order_item, order_status_history, payment reference, and review/rating. Builds toward complete PRD retention and owner order management stories.

---

## Q7: Owner payment methods (Issue 012) — what payment providers should the backend support?

The owner payment config is currently seeded with GCash, Maya, and bank transfer. For real backend integration:

- **Option A: Philippine-focused** — Support GCash, Maya (PayMaya), bank transfer, and cash on delivery. These are the dominant methods in PH food delivery.
- **Option B: Payment gateway integration** — Integrate with a gateway like PayMongo or Dragonpay that handles multiple PH payment methods through a single API.
- **Option C: Configuration only** — Just persist which methods the owner accepts (names + details) without actual payment processing. Payment processing comes later as a separate feature.

**A7:** Configuration only (Option C). Persist owner-configured payment methods (name, type, account details) per organization without actual payment processing. Gateway integration is a separate future feature.

---

## Q8: Owner verification (Issue 013) — should document uploads be real or just state tracking?

The verification flow currently seeds fake uploaded documents. For production:

- **Option A: Real file uploads** — Use Supabase Storage for document uploads (business permits, DTI/SEC registration, BIR). Track upload state, timestamps, and admin review workflow.
- **Option B: State tracking only** — Persist verification status per restaurant (draft → submitted → under_review → approved → rejected) without actual file storage. Owners mark steps complete, admin reviews externally.

**A8:** Real file uploads (Option A). Use Supabase Storage with a `seed-storage-buckets.ts` script following the same pattern as the next16bp boilerplate (idempotent bucket creation via raw SQL against `storage.buckets`). Buckets for verification documents (private), menu item images (public), avatars (public). Track upload state, timestamps, and admin review workflow per restaurant.

---

## Q9: Image handling (Issue 018) — how should menu item images work?

Remote image URLs from arbitrary hosts crash pages. Options:

- **Option A: Supabase Storage uploads only** — Remove the URL input entirely. Owners upload images to Supabase Storage. All images come from the allowed host.
- **Option B: Upload + URL with validation** — Allow both upload and URL input, but validate URLs against the configured `next.config.ts` remote patterns before saving.
- **Option C: Upload primary, URL fallback** — Upload via Supabase Storage as primary. Keep URL input but wrap `<Image>` in an error boundary with a placeholder fallback so bad URLs never crash the page.

**A9:** Supabase Storage uploads only (Option A). Remove the URL input entirely. Owners upload images to Supabase Storage — all images come from the allowed host. No need for URL validation or error boundaries since the source is always controlled. The crash is resolved by eliminating arbitrary URLs.

---

## Q10: Remaining scope — are there any issues you want to defer or deprioritize?

We've covered the major architectural decisions. The remaining issues are more straightforward:
- **Issue 003**: QR scanner (browser camera) ✓ decided
- **Issue 004**: Save-for-later on discovery cards (follows from saved_restaurant table)
- **Issue 009**: Dead owner nav links (remove or create missing routes)
- **Issue 010**: Onboarding wizard completion state (fix logic)
- **Issue 014**: Branch operating hours (persist to backend)
- **Issue 015**: Breadcrumb hydration errors (fix markup)
- **Issue 016**: Admin user access toggle (persist to backend)
- **Issue 017**: Add item dialog defaults/validation (fix form logic)

Should all of these be in scope, or should any be deferred?

**A10:** All in scope. No deferrals. All 18 issues will be resolved.

---

