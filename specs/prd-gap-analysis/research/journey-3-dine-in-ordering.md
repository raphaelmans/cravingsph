# Journey 3 — Dine-in Ordering Flow: Audit Findings

## Summary

**2/7 requirements fully implemented, 3 partial, 2 missing.**

Menu browsing and item customization are solid. The critical gap is the QR-to-table-session flow and the order submission frontend integration (backend exists but frontend is stubbed).

---

## Detailed Findings

### 1. QR scan → table session
**Status:** ❌ Missing
- QR generation exists (`qr-code-preview.tsx`) but encodes only restaurant slug URL, not table number
- **No QR decoding logic** in codebase
- **No table session entity** in database schema
- **No table parameter** in `/restaurant/[slug]` route — no query param handling for table from QR
- No mechanism to create/manage table sessions or persist table context through ordering

### 2. Menu browsing
**Status:** ✅ Implemented
- `src/features/menu/components/restaurant-menu.tsx` — full category/item/variant/modifier browsing
- `src/modules/menu/menu.router.ts` — `getPublicMenu(branchId)` procedure
- Category tabs, search, inline quantity controls all working

### 3. Item customization (modifiers)
**Status:** ✅ Implemented
- Modifier groups with `isRequired`, `minSelections`, `maxSelections`
- `menu-item-sheet.tsx` enforces modifier validation (required must be selected, multi-select respects limits)
- `modifier-group.tsx` — radio for single-select, checkboxes for multi-select, "Required"/"Optional" badges

### 4. Cart review
**Status:** ✅ Implemented
- Zustand store (`cart.store.ts`) with add/remove/update, quantity adjustment, item merging, localStorage persistence
- Cart drawer shows items, subtotal, quantity controls

### 5. Order submission
**Status:** 🟡 Partial — Backend exists, frontend stubbed

**Backend (working):**
- Order schema: `branchId` (required), `tableNumber` (optional varchar), `customerId` (nullable), `orderType` (dine-in/pickup)
- Order service: `create()` validates branch accepts orders, calculates totals, creates order + items + timeline
- Order router: `create` mutation exposed via tRPC

**Frontend (stubbed):**
- `restaurant-menu.tsx` line 264: `// TODO: Replace with order.create tRPC mutation`
- Uses `await new Promise(resolve => setTimeout(resolve, 1200))` with fake UUID
- **Critical blocker**: Cart stores `branchSlug` but `order.create` needs `branchId` (UUID). No slug→ID lookup mechanism in checkout

### 6. Order confirmation
**Status:** 🟡 Partial
- Confirmation sheet UI exists (`order-confirmation-sheet.tsx`) — shows success, order ID, redirect
- Order tracking page (`/restaurant/[slug]/order/[orderId]`) exists but uses **hard-coded stub data**
- No real `order.getDetail()` tRPC call
- No Supabase Realtime subscription for live status updates

### 7. Table-tied orders
**Status:** 🟡 Partial
- Schema supports `tableNumber` but it's **optional** (PRD requires every order tied to table)
- Checkout form collects table number as optional input
- No table validation (no table entity exists)
- No QR linking to auto-populate table number

---

## Key Gaps to Close

### Critical (Blocking dine-in flow)
1. **QR + table session** — Encode table in QR, parse table param in restaurant route, create table session entity
2. **Order submission wiring** — Connect frontend checkout to `order.create` tRPC mutation. Resolve branchSlug→branchId (store `branchId` in cart or add lookup)
3. **Table number required** — Make `tableNumber` required for dine-in orders in schema and checkout

### High Priority
4. **Order tracking** — Replace stub data with real `order.getDetail()` query
5. **Branch ID resolution** — Store `branchId` (not just slug) in cart store

### Architecture Note
Missing database entities: no `table` entity (for table management), no `table_session` entity (for tracking active sessions). These may not be strictly required for MVP if table number is just a string from QR, but would be needed for proper session enforcement.
