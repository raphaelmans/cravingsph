# Implementation Plan — PRD v4 Gap Closure

## Checklist

- [ ] Step 1: Cart store — add branchId + tableNumber
- [ ] Step 2: QR code encodes table number + restaurant route parses it
- [ ] Step 3: Wire order submission to real tRPC mutation
- [ ] Step 4: Wire order tracking page to real data
- [ ] Step 5: Cuisine type schema migration (varchar → array)
- [ ] Step 6: Cuisine multi-select UI (search filter + restaurant form)
- [ ] Step 7: Barangay filter UI in both search modes
- [ ] Step 8: Geolocation fallback hook
- [ ] Step 9: Branch profileUrl schema + upload UI
- [ ] Step 10: Admin dashboard "Orders today" metric

---

## Step 1: Cart Store — Add branchId + tableNumber

**Objective:** Give the cart the data it needs to create a real order (branchId for the API, tableNumber for dine-in context).

**Implementation guidance:**

Files to modify:
- `src/features/cart/stores/cart.store.ts` — Add `branchId: string | null` and `tableNumber: string | null` fields to store state. Update `setBranch()` to accept `(slug: string, id: string)`. Add `setTableNumber(n: string)` action. Update `clearCart()` to reset both.
- `src/features/menu/components/restaurant-menu.tsx` — When calling `setBranch()`, pass both `branchSlug` and `branchId` (branchId is available from the restaurant page data that's already fetched).

**Test requirements:**
- Unit test: `cart.store.test.ts` — verify `setBranch("slug", "uuid")` stores both values; verify `setTableNumber("5")` persists; verify `clearCart()` resets all fields.

**Integration notes:** This is a prerequisite for Steps 2 and 3. No visible behavior change yet — just data plumbing.

**Demo:** Open restaurant menu, add item to cart, inspect localStorage — branchId and tableNumber should be present in cart state.

---

## Step 2: QR Code Encodes Table Number + Route Parses It

**Objective:** When a customer scans a table QR, the table number flows from the QR URL into the ordering context automatically.

**Implementation guidance:**

Files to modify:
- `src/features/branch-settings/components/qr-code-preview.tsx` — Add a table number input (number field, 1–99). Generate QR URL as `{publicUrl}?table={number}`. Show preview of the URL below the QR.
- `src/app/(public)/restaurant/[slug]/page.tsx` — Read `searchParams.table` from the URL. Pass `tableNumber` prop down to the menu component.
- `src/features/menu/components/restaurant-menu.tsx` — Accept `tableNumber` prop. On mount (or first item add), call `cart.setTableNumber(tableNumber)` if provided.
- `src/features/checkout/components/checkout-sheet.tsx` — Pre-fill table number input from cart store's `tableNumber`. If pre-filled from QR, show as read-only with a "(from QR)" label. If not from QR, keep editable but make required for dine-in.

**Test requirements:**
- Unit test: QR preview generates correct URL with table param.
- Manual: Scan QR → menu loads → proceed to checkout → table number pre-filled.

**Integration notes:** Depends on Step 1 (cart store has tableNumber field). This step makes the QR→table flow visible to users.

**Demo:** Owner generates QR for Table 5 → Customer scans → Opens menu → Goes to checkout → Table number shows "5" pre-filled.

---

## Step 3: Wire Order Submission to Real tRPC Mutation

**Objective:** Replace the stubbed `handleCheckoutSubmit` with a real `order.create` tRPC call, making dine-in ordering functional end-to-end.

**Implementation guidance:**

Files to modify:
- `src/modules/order/dtos/order.dto.ts` — Add Zod refinement: when `orderType === "dine-in"`, `tableNumber` must be non-empty string. Keep `tableNumber` optional at schema level (for future pickup orders).
- `src/features/menu/components/restaurant-menu.tsx` — Replace the TODO block (~line 260-280) with:
  1. Get `branchId` and `tableNumber` from cart store
  2. Map cart items to `CreateOrderInputSchema` format (menuItemId, variantId, quantity, modifiers)
  3. Call `trpc.order.create.mutate(payload)`
  4. On success: get real `orderId` from response, clear cart, show confirmation
  5. On error: show error toast, keep cart intact
- `src/features/checkout/components/checkout-sheet.tsx` — Add validation: block submit if `orderType === "dine-in"` and `tableNumber` is empty. Show inline error message.
- `src/features/checkout/components/order-confirmation-sheet.tsx` — Pass real `orderId` from mutation response (not fake UUID).

**Test requirements:**
- Unit test: `order.service.create()` — verify dine-in without tableNumber throws validation error.
- Integration: Add items → fill table number → submit → verify order record created in DB with correct branchId, tableNumber, items, modifiers.

**Integration notes:** Depends on Steps 1–2. After this step, the full scan→browse→cart→submit loop works with real data.

**Demo:** Add items to cart → Submit order → See real order confirmation with server-generated order number → Order appears in owner's order queue (Step 4 of Journey 4, already implemented).

---

## Step 4: Wire Order Tracking Page to Real Data

**Objective:** Replace stub data on the order tracking page with live order information that updates as staff progress the order.

**Implementation guidance:**

Files to modify:
- `src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx` — Remove `STUB_ORDER` constant. Add `trpc.order.getDetail.useQuery({ orderId })` call (or equivalent public procedure). Add `refetchInterval: 10_000` for polling. Handle loading/error states.
- `src/modules/order/order.router.ts` — Verify `getDetail` procedure exists and is accessible as `publicProcedure` (customers may not be authenticated). If it's `protectedProcedure`, consider adding a `getPublicDetail` that returns limited info (status, items, table, timestamps — no customer PII).
- `src/features/order-tracking/components/order-status-tracker.tsx` — Verify component props match the shape returned by `order.getDetail`. Adjust if needed.

**Test requirements:**
- Manual: Submit order → navigate to tracking page → see real order data → staff updates status in owner dashboard → tracking page reflects change within 15 seconds.

**Integration notes:** Depends on Step 3 (real orders exist to track). After this step, the full customer dine-in loop is complete: scan → browse → order → track.

**Demo:** Customer submits order → sees tracking page with "Placed" status → Staff accepts → tracking shows "Accepted" → Staff marks preparing → tracking shows "Preparing" → Staff marks ready → tracking shows "Ready for Pickup".

---

## Step 5: Cuisine Type Schema Migration (varchar → array)

**Objective:** Change the restaurant `cuisineType` field from a single varchar to a `cuisineTypes` text array, enabling multi-cuisine restaurants.

**Implementation guidance:**

Files to modify:
- New migration file via `pnpm db:generate`:
  ```sql
  ALTER TABLE restaurant ADD COLUMN cuisine_types TEXT[] DEFAULT '{}';
  UPDATE restaurant SET cuisine_types = ARRAY[cuisine_type] WHERE cuisine_type IS NOT NULL AND cuisine_type != '';
  ALTER TABLE restaurant DROP COLUMN cuisine_type;
  ```
- `src/shared/infra/db/schema/restaurant.ts` — Replace `cuisineType: varchar("cuisine_type", { length: 100 })` with `cuisineTypes: text("cuisine_types").array().default([])`.
- `src/modules/restaurant/dtos/restaurant.dto.ts` — Change `cuisineType: z.string()` to `cuisineTypes: z.array(z.string()).min(1, "Select at least one cuisine")`.
- `src/modules/restaurant/services/restaurant.service.ts` — Update any references from `cuisineType` to `cuisineTypes`.
- `src/modules/restaurant/repositories/restaurant.repository.ts` — Update queries that read/write `cuisineType`.
- `src/modules/discovery/repositories/discovery.repository.ts` — Update search queries: replace `ilike(restaurant.cuisineType, ...)` with array overlap logic (e.g., `arrayOverlaps(restaurant.cuisineTypes, filterValues)` or iterate with `OR` conditions).
- `src/modules/discovery/dtos/discovery.dto.ts` — Change `cuisine` in `SearchInputSchema` from `z.string()` to `z.string()` (keep as comma-separated string in URL, parse to array in service/repository).

**Test requirements:**
- Unit test: Restaurant creation with `cuisineTypes: ["Filipino", "Cafe"]` stores correctly.
- Unit test: Discovery search with `cuisine=["Filipino"]` returns restaurants that have "Filipino" in their array.
- Migration test: Run migration on seeded data, verify existing single values are correctly wrapped in arrays.

**Integration notes:** This is a breaking schema change. All code referencing `cuisineType` must be updated. Grep for `cuisineType` across the codebase to find all references.

**Demo:** Create restaurant with "Filipino" + "Cafe" cuisines → Search for "Filipino" → restaurant appears → Search for "Cafe" → same restaurant appears.

---

## Step 6: Cuisine Multi-Select UI (Search Filter + Restaurant Form)

**Objective:** Upgrade the search cuisine filter to multi-select and the restaurant creation form to use predefined cuisine options with multi-select.

**Implementation guidance:**

Files to modify:
- `src/features/discovery/components/cuisine-filter.tsx` — Change click handler to toggle individual cuisines (add/remove from array) instead of replacing. Track selected cuisines as `string[]`. Update URL param to comma-separated: `cuisine=filipino,japanese`. Visual: selected cuisines get active/highlighted state, multiple can be active simultaneously.
- `src/app/(public)/search/page.tsx` — Parse `cuisine` param as comma-separated string → split to array. Pass array to tRPC search query. Update `updateParams` to join array back to comma-separated string.
- `src/features/onboarding/components/restaurant-form.tsx` — Replace text input for cuisine with a multi-select button group (similar to amenities UI in branch form). Predefined options: Filipino, Japanese, Korean, Chinese, French, Italian, Mexican, Cafe, Bakery. Allow custom addition via "Other" input. Store as `cuisineTypes: string[]`.

**Test requirements:**
- Manual: On search page, select "Filipino" + "Japanese" → both highlighted → results include restaurants matching either. Deselect one → results update.
- Manual: In restaurant form, select 3 cuisines → submit → verify stored as array.

**Integration notes:** Depends on Step 5 (schema is array). Frontend and backend changes work together.

**Demo:** Search page → select "Filipino" and "Korean" → results filter to matching restaurants. Create restaurant → pick "Cafe" + "Bakery" → save → appears in both cuisine searches.

---

## Step 7: Barangay Filter UI in Both Search Modes

**Objective:** Surface the barangay filter (which the backend already supports) in the search UI for both restaurant and food search modes.

**Implementation guidance:**

Files to modify:
- `src/features/discovery/components/location-filter.tsx` — Extend to support barangay selection. After user selects a city, show available barangays as multi-select chips (query distinct barangays from branches in that city). If no city selected, show barangay input as free-text with autocomplete.
- `src/app/(public)/search/page.tsx` — Show location filter in food mode too (remove the `{mode === "restaurant" && ...}` conditional wrapping). Read `barangay` from URL params. Pass `barangay` to both `searchRestaurants` and `searchFood` tRPC calls.
- `src/modules/discovery/dtos/discovery.dto.ts` — Verify `SearchFoodInputSchema` includes `barangay` param (it does from audit). Optionally support array for multi-barangay.
- `src/modules/discovery/discovery.router.ts` — Add a `getBarangays` public procedure that returns distinct barangays, optionally filtered by city. Used for the autocomplete/chip list.

**Test requirements:**
- Manual: Search in restaurant mode → select city "Cebu" → barangays for Cebu appear → select "Guadalupe" → results filter to Guadalupe branches.
- Manual: Search in food mode → location filter visible → select barangay → results filtered.

**Integration notes:** Independent of Steps 5–6. Can be done in parallel.

**Demo:** Search for food "croissant" → toggle barangay filter → select "Guadalupe" → only restaurants in Guadalupe with croissants appear.

---

## Step 8: Geolocation Fallback Hook

**Objective:** When no location filter is selected, use the browser's geolocation API to sort results by proximity to the user.

**Implementation guidance:**

Files to create:
- `src/features/discovery/hooks/use-geolocation.ts` — Custom hook wrapping `navigator.geolocation.getCurrentPosition()`. Returns `{ latitude: number | null, longitude: number | null, loading: boolean, error: string | null, prompted: boolean }`. Cache result in sessionStorage to avoid re-prompting. Handle permission denied gracefully.

Files to modify:
- `src/app/(public)/search/page.tsx` — Use `useGeolocation()` hook. When no city/barangay is selected AND geolocation is available, pass `latitude`/`longitude` to search queries.
- `src/modules/discovery/dtos/discovery.dto.ts` — Add optional `latitude: z.number().optional()` and `longitude: z.number().optional()` to both search schemas.
- `src/modules/discovery/repositories/discovery.repository.ts` — When lat/lng provided, add `ORDER BY` clause using Haversine distance formula:
  ```sql
  (6371 * acos(cos(radians(lat)) * cos(radians(branch.latitude)) * cos(radians(branch.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(branch.latitude))))
  ```
  Requires `latitude`/`longitude` columns on branch table (check if they exist; if not, add in migration).
- `src/shared/infra/db/schema/branch.ts` — Add `latitude: doublePrecision("latitude")` and `longitude: doublePrecision("longitude")` if not present.

**Test requirements:**
- Unit test: `use-geolocation` hook — mock `navigator.geolocation`, verify returns coords. Mock denied permission, verify returns null gracefully.
- Manual: Allow geolocation → search with no filters → results sorted by proximity. Deny geolocation → results shown without location bias.

**Integration notes:** Requires branch table to have lat/lng columns (may need migration). This is the most complex search step. Can be deferred to last if time-constrained.

**Demo:** Open search page → browser asks for location → allow → results sorted nearest-first. Deny → results show normally without location sorting.

---

## Step 9: Branch profileUrl Schema + Upload UI

**Objective:** Add profile picture support to branches alongside the existing cover image.

**Implementation guidance:**

Files to modify:
- New migration: `ALTER TABLE branch ADD COLUMN profile_url TEXT;`
- `src/shared/infra/db/schema/branch.ts` — Add `profileUrl: text("profile_url")`.
- `src/modules/branch/dtos/branch.dto.ts` — Add `profileUrl: z.string().url().nullish()` to create/update schemas.
- `src/features/onboarding/components/branch-form.tsx` — Add two image upload fields: "Profile Picture" (square, used as avatar/logo) and "Cover Image" (wide, used as banner). Reuse existing image upload component pattern from the codebase.
- `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx` — Add profile picture upload to branch settings (alongside existing settings).
- `src/app/(public)/restaurant/[slug]/page.tsx` — Display branch profile picture in restaurant header (if available).

**Test requirements:**
- Manual: Create branch → upload profile picture → save → verify URL stored in DB. View restaurant public page → profile picture displayed.

**Integration notes:** Independent of other steps. Can be done in parallel with any workstream.

**Demo:** Owner creates branch → uploads profile pic and cover → public restaurant page shows both images.

---

## Step 10: Admin Dashboard "Orders Today" Metric

**Objective:** Wire the admin dashboard's "Orders today" stat card to show the real count instead of "--".

**Implementation guidance:**

Files to modify:
- `src/modules/admin/repositories/admin.repository.ts` — Add method `getOrdersTodayCount()`: `SELECT COUNT(*) FROM "order" WHERE created_at >= CURRENT_DATE`.
- `src/modules/admin/services/admin.service.ts` — Call repository method and include in dashboard overview response.
- `src/features/admin/components/admin-dashboard-page.tsx` — Display the real count from the API response instead of placeholder.

**Test requirements:**
- Unit test: `admin.repository.getOrdersTodayCount()` returns correct count for orders created today.

**Integration notes:** Small, self-contained change. Can be done anytime.

**Demo:** Admin opens dashboard → "Orders Today" shows actual count (e.g., "12") instead of "--".

---

## Implementation Sequence

```
Week 1: Dine-in Critical Path (Steps 1–4)
├── Step 1: Cart store (branchId + tableNumber)     ← foundation
├── Step 2: QR table encoding + route parsing        ← depends on 1
├── Step 3: Order submission wiring                  ← depends on 1
└── Step 4: Order tracking real data                 ← depends on 3

Week 2: Search + Schema (Steps 5–8)
├── Step 5: Cuisine schema migration                 ← foundation
├── Step 6: Cuisine multi-select UI                  ← depends on 5
├── Step 7: Barangay filter UI                       ← independent
└── Step 8: Geolocation fallback                     ← independent (can defer)

Week 3: Polish (Steps 9–10)
├── Step 9: Branch profileUrl + upload               ← independent
└── Step 10: Dashboard orders metric                 ← independent
```
