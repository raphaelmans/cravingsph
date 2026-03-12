# Implementation Plan — PRD v2 Track A

> **Design:** `specs/prd-v2-track-a/design.md`
> **Date:** 2026-03-12

## Checklist

- [ ] Step 1: Table schema + module scaffold
- [ ] Step 2: Table CRUD service + router
- [ ] Step 3: Owner table management UI
- [ ] Step 4: Table session schema + service
- [ ] Step 5: QR bootstrap endpoint + `/t/[publicId]` route
- [ ] Step 6: Menu context + browse-mode UI gating
- [ ] Step 7: Order schema migration (new columns)
- [ ] Step 8: Ticket code + idempotency utilities
- [ ] Step 9: Order service — `createTicket` (public, session-validated)
- [ ] Step 10: Checkout flow refactor (dine-in only, anonymous)
- [ ] Step 11: Ticket confirmation + status tracking (customer)
- [ ] Step 12: Owner ticket feed refactor (4-state lifecycle)
- [ ] Step 13: "Mark as Paid (Cash)" + session close
- [ ] Step 14: Feature flag system + deferred feature hiding
- [ ] Step 15: Branch schema enhancements (address, amenities, split hours)
- [ ] Step 16: Food search backend
- [ ] Step 17: Dual-mode search UI
- [ ] Step 18: Invite-only onboarding (admin + owner)
- [ ] Step 19: Onboarding wizard simplification
- [ ] Step 20: QR scanner update + integration polish

---

## Step 1: Table schema + module scaffold

**Objective:** Create the `table` database entity and scaffold the table module following existing patterns.

**Implementation guidance:**
- Create `src/shared/infra/db/schema/table.ts` with columns: `id` (uuid PK), `branchId` (uuid FK → branch, cascade), `tableNumber` (varchar 50), `publicId` (varchar 20, unique), `isActive` (boolean, default true), `createdAt`, `updatedAt`.
- Add unique index on `(branchId, tableNumber)` and index on `(branchId)`.
- Export from `src/shared/infra/db/schema/index.ts`.
- Scaffold `src/modules/table/` directory with empty files: `table.router.ts`, `services/table.service.ts`, `services/table-session.service.ts`, `repositories/table.repository.ts`, `repositories/table-session.repository.ts`, `dtos/table.dto.ts`, `errors/table.errors.ts`, `factories/table.factory.ts`.
- Install `nanoid` for `publicId` generation.
- Create a `generatePublicId()` utility in `src/modules/table/utils/public-id.ts` using `nanoid(10)`.
- Run `pnpm db:generate` to create migration, then `pnpm db:push` to apply.

**Test requirements:**
- Schema compiles and migration applies cleanly.

**Integration notes:**
- Schema is referenced by `table_session` (Step 4) and indirectly by `order` (Step 7).

**Demo:** Run `pnpm db:studio` and show the empty `table` table with correct columns.

---

## Step 2: Table CRUD service + router

**Objective:** Implement table CRUD operations — list, create, update, delete — with branch ownership authorization.

**Implementation guidance:**
- Implement `TableRepository` with methods: `findByBranch(branchId)`, `findById(id)`, `findByPublicId(publicId)`, `create(data)`, `update(id, data)`, `remove(id)`, `existsByBranchAndNumber(branchId, tableNumber)`.
- Implement `TableService` with methods: `list(userId, branchId)`, `create(userId, branchId, data)`, `update(userId, tableId, data)`, `remove(userId, tableId)`. Each method calls `assertBranchOwnership()` following the existing pattern (user → org → restaurant → branch chain).
- Implement DTOs: `CreateTableInputSchema` (branchId, tableNumber), `UpdateTableInputSchema` (tableId, tableNumber?, isActive?).
- Implement errors: `TableNotFoundError`, `DuplicateTableNumberError`.
- Implement factory: `makeTableRepository()`, `makeTableService()` — lazy singletons using `getContainer()`.
- Wire `tableRouter` with `protectedProcedure` for all CRUD operations.
- Register `table: tableRouter` in `src/shared/infra/trpc/root.ts`.

**Test requirements:**
- Unit tests for `TableService`: create (happy path, duplicate number rejection), list (branch-scoped), update (toggle isActive), delete. Mock repository layer.

**Integration notes:**
- Router is now callable from owner UI (Step 3).

**Demo:** Call `table.create` and `table.list` via tRPC devtools or test script.

---

## Step 3: Owner table management UI

**Objective:** Build the owner-facing table management page where staff can add/edit/remove tables and view QR codes.

**Implementation guidance:**
- Create route: `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/tables/page.tsx`.
- Create `src/features/table-management/` directory with components:
  - `TableList` — grid of `TableCard` components, empty state if no tables.
  - `TableCard` — shows table number, active/inactive badge, QR preview button, edit/delete actions.
  - `AddTableDialog` — dialog form with `tableNumber` input, calls `table.create`.
  - `EditTableDialog` — pre-filled form, calls `table.update`.
  - `TableQRPreview` — reuses `QRCodePreview` pattern from `src/features/branch-settings/components/qr-code-preview.tsx` with URL `/t/{publicId}`.
- Create `src/features/table-management/hooks/use-table-management.ts` with hooks wrapping tRPC: `useTables(branchId)`, `useCreateTable(branchId)`, `useUpdateTable(branchId)`, `useDeleteTable(branchId)`.
- Add navigation link to this page from branch settings or branch sidebar.

**Test requirements:**
- Components render without errors (smoke test).
- E2E: create a table, verify it appears in the list with QR code.

**Integration notes:**
- QR codes encode `/t/{publicId}` — this URL is handled in Step 5.

**Demo:** Owner creates "T1", "T2", "Patio 3" — sees them listed with QR download buttons.

---

## Step 4: Table session schema + service

**Objective:** Create the `table_session` entity and service for auto-creating and closing sessions.

**Implementation guidance:**
- Create `src/shared/infra/db/schema/table-session.ts` with columns: `id` (uuid PK), `tableId` (uuid FK → table, cascade), `branchId` (uuid FK → branch, denormalized), `status` (varchar 20, default 'active'), `closedBy` (uuid FK → auth.users, nullable, set null), `createdAt`, `closedAt` (nullable).
- Indexes: `(tableId, status)`, `(branchId, status)`.
- Export from schema barrel.
- Implement `TableSessionRepository`: `findActiveByTable(tableId)`, `create(data)`, `close(id, closedBy)`, `findById(id)`, `findByBranch(branchId, status?)`.
- Implement `TableSessionService`:
  - `findOrCreateForTable(tableId, branchId)` — checks for existing active session, creates one if none exists. Returns `TableSessionRecord`.
  - `close(userId, tableSessionId)` — sets status to 'closed', records closedBy and closedAt. Validates ownership.
  - `isActive(tableSessionId)` — returns boolean.
- Add router procedures: `table.closeSession` (protectedProcedure), `table.listSessions` (protectedProcedure).
- Run migration.

**Test requirements:**
- Unit tests for `TableSessionService`: findOrCreate (creates new, resumes existing), close (sets fields correctly), isActive (true when active, false when closed).
- Test: calling findOrCreate twice for the same table returns the same session.

**Integration notes:**
- Used by bootstrap endpoint (Step 5) and order creation (Step 9).

**Demo:** Call `findOrCreateForTable` in a test — verify session is created and reused.

---

## Step 5: QR bootstrap endpoint + `/t/[publicId]` route

**Objective:** When a customer scans a table QR, resolve the table, create/resume a session, and return the menu with dine-in capability.

**Implementation guidance:**
- Add `table.bootstrap` public procedure:
  - Input: `{ publicId: string }`
  - Logic: find table by publicId → check `table.isActive` and `branch.isOrderingEnabled` → call `tableSessionService.findOrCreateForTable()` → return `MenuContext` with `mode: "dine_in"`, `tableSessionId`, `tableNumber`, `branchSlug`.
  - If table not found or inactive or ordering disabled → return `MenuContext` with `mode: "browse"` and explanation message.
- Create route `src/app/(public)/t/[publicId]/page.tsx`:
  - Server component.
  - Calls `table.bootstrap({ publicId })` via server caller.
  - Fetches restaurant and menu data using `branchSlug` from the response.
  - Renders `RestaurantHeader` + `RestaurantMenu` with `menuContext` prop.
- Add `/t/[publicId]` to `appRoutes` as a public route.
- Store `tableSessionId` client-side: set a cookie or pass via URL/props to the `RestaurantMenu` component.

**Test requirements:**
- Unit test: bootstrap with valid active table → returns dine_in context.
- Unit test: bootstrap with inactive table → returns browse context.
- Unit test: bootstrap with ordering disabled → returns browse context.
- E2E: navigate to `/t/{publicId}` → verify menu loads with correct context.

**Integration notes:**
- `RestaurantMenu` must accept `menuContext` prop (Step 6).
- `tableSessionId` flows to checkout (Step 10).

**Demo:** Scan (or navigate to) a table QR URL → menu loads with ordering enabled.

---

## Step 6: Menu context + browse-mode UI gating

**Objective:** Adapt the existing menu UI to support two modes: browse (cart disabled) and dine-in (cart enabled).

**Implementation guidance:**
- Add `menuContext?: MenuContext` prop to `RestaurantMenu` component.
- When `menuContext` is undefined or `mode === "browse"`:
  - Hide `CartFloatingButton`.
  - Replace quick-add buttons on `MenuItemCard` with disabled state or no button.
  - Disable "Add to cart" button in `MenuItemSheet` (gray out, show tooltip).
  - Show a CTA banner at the top: "Visit the restaurant and scan a table QR to order."
  - Hide `CheckoutSheet`, `OrderConfirmationSheet`, `PaymentSheet` triggers.
- When `mode === "dine_in"`:
  - Enable all cart interactions (current behavior).
  - Pass `tableSessionId` and `tableNumber` down to checkout.
- Modify existing restaurant page (`/r/[slug]/page.tsx`) to pass no `menuContext` (always browse mode).
- Update `MenuItemCard` to accept an `isOrderingEnabled` prop.
- Update `MenuItemSheet` to accept `isOrderingEnabled` and conditionally render the add-to-cart button.

**Test requirements:**
- E2E: visit `/r/{slug}` → verify cart button not visible, quick-add disabled, CTA banner visible.
- E2E: visit `/t/{publicId}` → verify cart button visible, quick-add works.

**Integration notes:**
- Browse mode CTA could link to info about scanning a QR at the restaurant.

**Demo:** Side-by-side: browse mode (restaurant page) vs dine-in mode (table QR page).

---

## Step 7: Order schema migration (new columns)

**Objective:** Add `tableSessionId`, `ticketCode`, and `idempotencyKey` columns to the `order` table.

**Implementation guidance:**
- Modify `src/shared/infra/db/schema/order.ts`:
  - Add `tableSessionId` (uuid, nullable, FK → table_session, set null).
  - Add `ticketCode` (varchar 20, nullable).
  - Add `idempotencyKey` (varchar 100, nullable).
- Add indexes: unique on `(idempotencyKey)` where not null, index on `(tableSessionId)`.
- Change `status` default from `'placed'` to `'new'`.
- Run `pnpm db:generate && pnpm db:push`.
- Update `OrderRecord` and `InsertOrder` types (auto-generated from schema).

**Test requirements:**
- Migration applies without errors.
- Existing orders are unaffected (new columns are nullable).

**Integration notes:**
- Used by `createTicket` (Step 9). Existing `order.create` continues to work for legacy code during transition.

**Demo:** View updated schema in DB studio.

---

## Step 8: Ticket code + idempotency utilities

**Objective:** Create utilities for generating human-readable ticket codes and client-side idempotency keys.

**Implementation guidance:**
- Create `src/modules/order/utils/ticket-code.ts`:
  - `generateTicketCode(dailySequence: number): string` — letter prefix (A-Z cycling by day of month) + 3-digit zero-padded sequence. E.g., day 1 → "A-001", day 2 → "B-001".
  - `getNextDailySequence(branchId: string, db): Promise<number>` — queries `SELECT COUNT(*) + 1 FROM order WHERE branchId = ? AND ticketCode IS NOT NULL AND DATE(createdAt) = CURRENT_DATE`.
- Create `src/features/checkout/utils/idempotency.ts` (client-side):
  - `generateIdempotencyKey(): string` — returns `crypto.randomUUID()`.
- Create `src/modules/order/utils/availability-checker.ts`:
  - `checkItemAvailability(items: OrderItemInput[], branchId: string, db): Promise<{ valid: boolean; unavailableItems: string[] }>` — queries menu_item table for `isAvailable` status of all submitted items.

**Test requirements:**
- Unit test: ticket code format is correct for various daily sequences and days.
- Unit test: ticket code letter cycles correctly (day 1 → A, day 27 → B).
- Unit test: availability checker catches sold-out items.

**Integration notes:**
- Used by `OrderService.createTicket` (Step 9).

**Demo:** Generate a few ticket codes — "A-001", "A-002", etc.

---

## Step 9: Order service — `createTicket`

**Objective:** Implement the core dine-in order submission: validate session, check availability, enforce idempotency, create immutable ticket.

**Implementation guidance:**
- Add `CreateTicketInputSchema` to `src/modules/order/dtos/order.dto.ts`:
  - `tableSessionId` (uuid), `idempotencyKey` (uuid), `specialInstructions` (optional, max 2000), `items` (array, min 1).
- Add `createTicket(input)` method to `OrderService`:
  1. Check idempotency: query by `idempotencyKey`. If exists, return existing order (no error).
  2. Validate table session: call `tableSessionService.isActive(input.tableSessionId)`. Throw `SessionClosedError` if not active.
  3. Load table session to get `branchId`. Validate `branch.isOrderingEnabled`. Throw `BranchNotAcceptingOrdersError` if disabled.
  4. Check item/modifier availability via `checkItemAvailability()`. Throw `ItemUnavailableError` with names if any unavailable.
  5. Calculate total amount.
  6. Generate ticket code via `generateTicketCode()`.
  7. Generate order number via `nextOrderNumber()`.
  8. Create order record: `status: "new"`, `orderType: "dine-in"`, `customerId: null`, `tableSessionId`, `ticketCode`, `idempotencyKey`, `tableNumber` (from table entity).
  9. Create order items.
  10. Add timeline event: "Dine-in ticket submitted".
  11. Return `OrderDTO` with ticket code.
- Add new errors: `SessionClosedError`, `TableSessionInvalidError`, `ItemUnavailableError`, `DuplicateSubmissionError` (handled internally, not thrown to client).
- Add `order.createTicket` as `publicProcedure` in the router.
- Update `OrderService` constructor to accept `TableSessionService` dependency.
- Update `order.factory.ts` to wire the new dependency.

**Test requirements:**
- Unit tests (critical):
  - Happy path: valid session → ticket created with correct fields.
  - Idempotency: same key twice → returns same ticket, no duplicate.
  - Closed session → `SessionClosedError`.
  - Ordering disabled → `BranchNotAcceptingOrdersError`.
  - Sold-out item → `ItemUnavailableError` with item names.
  - Multiple tickets same session → independent orders with different ticket codes.

**Integration notes:**
- This is the keystone step. Once this works, the full ordering loop is functional.

**Demo:** Submit a ticket via tRPC → verify it appears in DB with ticket code, table session link, and correct status.

---

## Step 10: Checkout flow refactor (dine-in only, anonymous)

**Objective:** Simplify the checkout UI for dine-in ordering: no order type selector, no customer name/phone, no login required.

**Implementation guidance:**
- Modify `CheckoutSheet`:
  - Remove `OrderTypeSelector` (conditionally hidden when `ff.order_ahead` is false).
  - Remove `customerName` and `customerPhone` fields (not needed for dine-in).
  - Remove `tableNumber` manual input — show it as a read-only badge from `menuContext.tableNumber`.
  - Keep `specialInstructions` textarea.
  - Keep order summary (items, subtotal).
  - Submit button generates `idempotencyKey` via `crypto.randomUUID()` and calls `order.createTicket` with `tableSessionId` from cart store.
- Update `RestaurantMenu` orchestrator:
  - `handleCheckoutSubmit` calls `order.createTicket` (public mutation) instead of `order.create` (protected mutation).
  - On success: show `OrderConfirmationSheet` with `ticketCode` and `tableNumber`.
  - Clear cart after successful submission.
- Update cart store:
  - Add `tableSessionId` and `tableNumber` to state.
  - On `setTableSession(id, number)`: if different from current, clear cart items (new table = fresh cart).
  - Persist `tableSessionId` alongside items.

**Test requirements:**
- E2E: full flow from `/t/{publicId}` → add items → checkout → submit → confirmation screen with ticket code.

**Integration notes:**
- `OrderConfirmationSheet` modified in Step 11.
- Existing `order.create` (protectedProcedure) stays for now — no breaking change.

**Demo:** Complete a dine-in order from QR scan to confirmation without ever logging in.

---

## Step 11: Ticket confirmation + status tracking (customer)

**Objective:** Show the customer their ticket code, table number, and real-time status after submission.

**Implementation guidance:**
- Modify `OrderConfirmationSheet`:
  - Show ticket code prominently (large text).
  - Show table number badge.
  - Show ordered items summary.
  - Remove "Upload Payment Proof" button (feature-flagged in Step 14).
  - Add "Order More" button → closes sheet, returns to menu (cart is empty, ready for new items).
  - Add "View Ticket Status" button → navigates to tracking page.
- Modify order tracking page (`/r/[slug]/order/[orderId]/page.tsx`):
  - Replace stub data with actual tRPC query (`order.getDetail`).
  - Show ticket code instead of order number as primary identifier.
  - Show table number.
  - Update `OrderStatusTracker` to use 4 states: new → preparing → ready → completed.
  - Remove payment-related UI (feature-flagged in Step 14).
- Consider: the tracking page needs to work for anonymous users. Either:
  - (a) Make the page public and use the order ID in the URL as access control (unguessable UUID), or
  - (b) Store the order ID in localStorage after submission and check on the tracking page.
  - Option (a) is simpler and sufficient for v1.
- Add `order.getPublicDetail` as a `publicProcedure` that returns ticket info by order ID (limited fields, no customer PII).

**Test requirements:**
- E2E: submit order → see confirmation with ticket code → navigate to tracking → see status "New".

**Integration notes:**
- Status updates from owner (Step 12) should reflect on this page.

**Demo:** Customer sees "Ticket A-001 — Table T3 — New" after submitting.

---

## Step 12: Owner ticket feed refactor (4-state lifecycle)

**Objective:** Refactor the existing order management dashboard into a ticket feed with 4-state lifecycle and table context.

**Implementation guidance:**
- Update `src/features/order-management/types.ts`:
  - Change `OrderStatus` to `'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'`.
  - Change `OrderTab` to `'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'`.
  - Update `TAB_STATUS_MAP` accordingly.
- Update `OrderRow` component:
  - Show `ticketCode` prominently (instead of or alongside `orderNumber`).
  - Show `tableNumber` with table icon.
  - Remove accept/reject buttons for "new" tickets (no accept step).
  - Show `StatusUpdateDropdown` for "new" tickets with transitions: new → preparing.
- Update `StatusUpdateDropdown`:
  - New transitions: `new → [preparing]`, `preparing → [ready]`, `ready → [completed]`.
  - Add cancel option from any state.
- Remove or hide `AcceptRejectActions` component.
- Remove or hide `PaymentProofReview` component (feature-flagged in Step 14).
- Update `OrderDashboardTabs` to use new tab structure.
- Update `useOrderManagement` hook: remove `useAcceptOrder`, `useRejectOrder`. Update `useUpdateOrderStatus` for new transitions.
- Update `OrderService` `VALID_TRANSITIONS`:
  ```ts
  new: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  ```
- Update `order.listByBranch` to handle the new status values gracefully (both old and new statuses during transition period).

**Test requirements:**
- Unit test: status transitions follow 4-state machine.
- Unit test: cancel works from any active state.
- E2E: owner opens ticket feed → sees new ticket → progresses to preparing → ready → completed.

**Integration notes:**
- Old orders with status "placed" or "accepted" should map to "new" and "preparing" respectively in the UI during transition.

**Demo:** Owner receives a ticket, progresses it through all states.

---

## Step 13: "Mark as Paid (Cash)" + session close

**Objective:** Add the cash payment shortcut for owners and the ability to close table sessions.

**Implementation guidance:**
- Add `order.markPaid` procedure (protectedProcedure):
  - Input: `orderId`
  - Sets `paymentStatus: "confirmed"`.
  - Records timeline event: "Marked as paid (cash)".
- Add a "Mark as Paid" button on `OrderRow` and `OrderDetail` (visible for all active tickets).
- Wire `table.closeSession` to the owner UI:
  - Add "Close Session" button on `TableCard` (visible when session is active).
  - Closing a session sets `tableSession.status = "closed"`.
  - After close, any order submission against that `tableSessionId` is rejected.
- Add session status indicator on the table management page: show "Active" with duration badge or "Idle".
- Update `table.list` to include active session info per table (join or subquery).

**Test requirements:**
- Unit test: markPaid sets paymentStatus correctly.
- Unit test: order submission against closed session throws `SessionClosedError`.
- E2E: owner closes session → customer trying to submit gets error.

**Integration notes:**
- Session close is the staff-side complement to auto-create on scan.

**Demo:** Owner marks ticket as paid, then closes the table session.

---

## Step 14: Feature flag system + deferred feature hiding

**Objective:** Implement config-based feature flags and hide deferred features.

**Implementation guidance:**
- Create `src/lib/feature-flags.ts`:
  - Read flags from environment variables: `FF_SAVED_RESTAURANTS`, `FF_REVIEWS`, `FF_ORDER_HISTORY`, `FF_DIGITAL_PAYMENTS`, `FF_ORDER_AHEAD`.
  - Export `featureFlags` object and `isEnabled(flag)` function.
  - All default to `false`.
- Add `.env.example` entries for the 5 flags.
- **Saved restaurants** (3 entry points):
  - `customer-bottom-nav.tsx` — conditionally render "Saved" tab.
  - `restaurant-card.tsx` — conditionally render heart button.
  - `/saved/page.tsx` — redirect to home if flag is off (or render empty state).
- **Reviews** (3 entry points):
  - `/r/[slug]/page.tsx` — conditionally render `<RestaurantReviews>`.
  - `customer-orders-page.tsx` — conditionally render "Leave a review" button.
  - `review-sheet.tsx` — don't open if flag is off.
- **Order history** (3 entry points):
  - `customer-bottom-nav.tsx` — conditionally render "Orders" tab.
  - `/orders/page.tsx` — redirect or empty state.
- **Digital payments** (6+ entry points):
  - `payment-sheet.tsx` — don't render.
  - `restaurant-menu.tsx` — remove PaymentSheet integration.
  - Order tracking page — remove "Upload Payment Proof" button.
  - Owner payments page — redirect or hide nav link.
  - `payment-config/` components — don't render.
  - `payment-proof-review.tsx` — don't render (but keep "Mark as Paid" from Step 13).
- **Pickup ordering** (3 entry points):
  - `order-type-selector.tsx` — don't render (default dine-in).
  - `checkout-sheet.tsx` — remove pickup fields.
  - `payment-sheet.tsx` — remove pickup branching.
- Hard-remove from onboarding wizard:
  - Remove payment method setup step.
  - Remove verification document step.

**Test requirements:**
- E2E: with all flags false, verify: no "Saved" tab, no "Orders" tab, no heart buttons, no reviews section, no payment proof UI.

**Integration notes:**
- Flags are environment-based, so toggling requires a redeploy (acceptable for v1).

**Demo:** Navigate the app — all deferred features are invisible.

---

## Step 15: Branch schema enhancements (address, amenities, split hours)

**Objective:** Add structured address fields, amenities, and split operating hours to branches.

**Implementation guidance:**
- **Schema changes** to `branch`:
  - Add `street` (varchar 200, nullable), `barangay` (varchar 100, nullable).
  - Add `amenities` (jsonb, default `'[]'::jsonb`).
- **Schema changes** to `operating_hours`:
  - Add `rangeIndex` (integer, default 0).
  - Drop unique index on `(branchId, dayOfWeek)`.
  - Add unique index on `(branchId, dayOfWeek, rangeIndex)`.
- Run migration.
- Update `BranchService` and DTOs:
  - `UpdateBranchSchema` gains `street`, `barangay`, `amenities`.
  - `CreateBranchSchema` gains same.
  - Remove `autoAcceptOrders` and `paymentCountdownMinutes` from the update DTO (or keep in schema but remove from UI).
- Update `WeeklyHoursEditor`:
  - Support multiple time ranges per day.
  - "Add time range" button per day.
  - "Remove range" button (if more than one range exists for a day).
  - Update `OperatingHourEntry` type to include `rangeIndex`.
- Update branch settings page:
  - Add street and barangay fields to the branch form.
  - Add amenity toggles (checkbox grid with icons).
  - Remove auto-accept toggle and payment countdown from settings UI.
- Update `BranchService.updateOperatingHours` to handle multiple ranges per day.

**Test requirements:**
- Unit test: operating hours service correctly handles multiple ranges per day.
- Verify existing single-range data still works (rangeIndex defaults to 0).

**Integration notes:**
- Barangay field enables Phase 7 search filtering by barangay.
- Amenities display on restaurant page (can be added to `RestaurantHeader` or a new section).

**Demo:** Owner adds split hours for Monday (8AM-12PM + 4PM-10PM), adds amenities, saves.

---

## Step 16: Food search backend

**Objective:** Add a food/dish search procedure that queries menu items and returns restaurants with matched dishes.

**Implementation guidance:**
- Add `discovery.searchFood` procedure (publicProcedure):
  - Input: `{ query: string (min 1, max 200), barangay?: string[], limit?: number (default 20, max 50) }`.
  - Repository query: JOIN `restaurant → branch → category → menu_item`. ILIKE on `menu_item.name`. Filter by `branch.isActive`, `restaurant.isActive`, optionally `branch.barangay IN (...)`. Group by restaurant.
  - Return `FoodSearchResultDTO[]`: each entry is a `RestaurantPreviewDTO` plus `matchedDishes: { name, imageUrl, price }[]` (top 5 matches per restaurant).
- Add `FoodSearchResultDTO` to `discovery.dtos.ts`.
- Implement `DiscoveryRepository.searchFood(opts)`:
  - Raw SQL or Drizzle query joining menu items.
  - ROW_NUMBER window function to limit matched dishes per restaurant.
  - Case-insensitive ILIKE on menu item name.
- Update `DiscoveryService` to expose `searchFood()`.
- Update existing `discovery.search` to accept `barangay` parameter (array, optional) in addition to `city`. Change city filter to barangay filter if provided.

**Test requirements:**
- Unit test: food search with "croiss" returns restaurants with "Croissant" items.
- Unit test: empty query is rejected.
- Unit test: barangay filter narrows results correctly.
- Unit test: result includes matched dish names, images, prices.

**Integration notes:**
- UI toggle and display in Step 17.

**Demo:** Call `discovery.searchFood({ query: "porkchop" })` — see restaurant results with matched dish details.

---

## Step 17: Dual-mode search UI

**Objective:** Add the Food | Restaurant toggle to the search interface and wire up the food search results display.

**Implementation guidance:**
- Create `SearchModeToggle` component: two pill buttons ("Restaurant" / "Food"), controlled by URL param `mode`.
- Add to search page sticky header, between the search input and cuisine filter.
- URL param: `mode=food` or `mode=restaurant` (default). Use `updateParams()` pattern already in the search page.
- When `mode === "food"`:
  - Hide cuisine filter (not relevant for food search).
  - Require non-empty query (show inline validation or disable search).
  - Call `discovery.searchFood()` instead of `discovery.search()`.
  - Render `FoodSearchResultCard` components: restaurant card with matched dishes section underneath (dish name, image thumbnail, price).
- When `mode === "restaurant"`:
  - Existing behavior (name, cuisine, location filters).
  - Replace city filter with barangay filter if available (or keep city and add barangay).
- Query persistence: switching modes keeps the typed query text (already works via URL params).
- Location fallback: if no barangay selected, pass user's geolocation (via browser API or omit for server-side default).
- Create `FoodSearchResultCard` component:
  - Extends `RestaurantCard` layout.
  - Below the restaurant info, show matched dishes in a horizontal scroll or list: dish image thumbnail, name, price.
  - Clicking anywhere navigates to `/r/{slug}` (browse mode).

**Test requirements:**
- E2E: toggle to Food mode, search "croissant", see restaurant results with matched dish names.
- E2E: toggle back to Restaurant mode, see original filters.
- E2E: typed query persists when switching modes.

**Integration notes:**
- Search results always link to browse mode. Ordering requires a QR scan at the venue.

**Demo:** Search for "porkchop" in Food mode → see restaurants with matched dishes.

---

## Step 18: Invite-only onboarding (admin + owner)

**Objective:** Implement the admin invite link system and invite-based owner registration.

**Implementation guidance:**
- Create `src/shared/infra/db/schema/invite.ts` with columns per design (id, email, token, restaurantName, expiresAt, usedAt, createdBy).
- Export from schema barrel. Run migration.
- Create `src/modules/invite/` module:
  - `InviteRepository`: `create(data)`, `findByToken(token)`, `markUsed(id)`.
  - `InviteService`: `createInvite(adminUserId, email, restaurantName?)` — generates token (nanoid 20), sets 7-day expiry. `validateInvite(token)` — checks existence, expiry, usage.
  - `InviteRouter`: `admin.createInvite` (adminProcedure), `auth.validateInvite` (publicProcedure).
  - Errors: `InviteNotFoundError`, `InviteAlreadyUsedError`, `InviteExpiredError`.
- Create admin UI page: `src/app/(admin)/admin/invites/page.tsx`:
  - Form: email input, optional restaurant name.
  - Generate invite → show URL + copy button.
  - List of recent invites with status (pending/used/expired).
- Modify registration flow:
  - `/register/owner` route accepts `?token=` query param.
  - On load: validate token via `auth.validateInvite`. If invalid/expired → show error.
  - If valid: pre-fill email (read-only), show password creation form.
  - On submit: register user (existing flow) + mark invite as used.
- Block public owner registration: if no `token` param → redirect to a "Contact CravingsPH" page or show info message.

**Test requirements:**
- Unit test: invite creation generates valid token with correct expiry.
- Unit test: validate catches expired and used invites.
- E2E: admin creates invite → owner opens link → registers → lands on owner dashboard.

**Integration notes:**
- Existing registration flow modified, not replaced.

**Demo:** Admin generates invite for "chef@restaurant.com" → chef opens link → creates account → sees onboarding wizard.

---

## Step 19: Onboarding wizard simplification

**Objective:** Remove payment method setup and verification document steps from the onboarding wizard.

**Implementation guidance:**
- Read the onboarding wizard in `src/features/onboarding/`.
- Identify and remove (or skip) the payment method configuration step.
- Identify and remove (or skip) the verification document upload step.
- Update step count and progress indicators.
- Remaining steps: create org → add restaurant → create branch (with new structured address + amenities) → build menu.
- Update branch creation form in onboarding to include: street, barangay, amenities fields (from Step 15).
- Ensure the wizard completion redirects to the owner dashboard.

**Test requirements:**
- E2E: complete the onboarding wizard with only org → restaurant → branch → menu steps.

**Integration notes:**
- Admin can still access verification and payment config via their own admin tools if needed, but owners don't see them.

**Demo:** New owner goes through a clean 4-step onboarding wizard.

---

## Step 20: QR scanner update + integration polish

**Objective:** Update the QR scanner to handle the new `/t/{publicId}` URL format and polish the full end-to-end flow.

**Implementation guidance:**
- Update `QrScannerModal` (`src/features/discovery/components/qr-scanner-modal.tsx`):
  - Add parsing for `/t/{publicId}` format.
  - On successful scan: navigate to `/t/{publicId}` (not `/restaurant/{slug}`).
  - Keep backward compatibility: still handle `cravings://slug` and `/restaurant/{slug}` formats (navigate to browse mode).
- Update "Scan QR" CTA on home page to mention table ordering.
- Polish:
  - Loading states during bootstrap.
  - Error states (table not found, ordering disabled).
  - Transition between browse and dine-in modes.
  - Cart clearing when session changes.
  - Toast messages for key actions (ticket submitted, session closed).
- Verify end-to-end flows:
  - Customer: home → scan QR → menu → customize → cart → checkout → confirmation → status tracking.
  - Owner: create tables → generate QR → receive ticket → progress status → mark paid → close session.
  - Admin: generate invite → owner registers → sets up restaurant → goes live.
  - Search: toggle Food/Restaurant → search → browse restaurant.

**Test requirements:**
- E2E: full end-to-end dine-in flow from QR scan to ticket completion.
- E2E: full owner setup flow from invite to first ticket received.

**Integration notes:**
- This is the final integration and polish step.

**Demo:** Complete walkthrough: admin invites owner → owner sets up restaurant → customer scans QR → places order → owner completes ticket.
