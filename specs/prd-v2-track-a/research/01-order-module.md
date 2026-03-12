# Research: Existing Order Module

## Order Schema (`src/shared/infra/db/schema/order.ts`)

**order table:**
- `id` (uuid PK), `orderNumber` (varchar 20, unique, e.g. "ORD-0042")
- `branchId` (uuid FK → branch, cascade), `customerId` (uuid FK → auth.users, set null)
- `orderType` (varchar 20: 'dine-in' | 'pickup')
- `customerName`, `customerPhone` (nullable, for pickup)
- `tableNumber` (varchar 20, nullable, plain text — no FK to any table entity)
- `totalAmount` (numeric 10,2), `status` (varchar 20, default 'placed')
- `paymentStatus` (varchar 20, default 'pending'), `paymentMethod`, `paymentReference`, `paymentScreenshotUrl`
- `specialInstructions` (text), `createdAt`, `updatedAt`

**Indexes:** `(branchId, status)`, `(customerId)`, `(createdAt)`

**order_item table** (`src/shared/infra/db/schema/order-item.ts`):
- `id`, `orderId` (FK cascade), `menuItemId` (FK set null), `itemVariantId` (FK set null)
- `name` (snapshot at purchase), `quantity`, `unitPrice`, `modifiers` (jsonb)

**order_status_history table** (`src/shared/infra/db/schema/order-status-history.ts`):
- `id`, `orderId` (FK cascade), `fromStatus`, `toStatus`, `changedBy` (FK → auth.users), `note`, `createdAt`

## Order Repository (`src/modules/order/repositories/order.repository.ts`)

Key methods:
- `nextOrderNumber()` — generates sequential "ORD-XXXX"
- `create(data)` → OrderRow
- `createItems(orderId, items)` — batch insert
- `addTimelineEvent(data)` — audit trail
- `findById(id)`, `findItemsByOrderId(orderId)`, `findByBranch(branchId, status?)`, `findByCustomer(customerId)`
- `findTimeline(orderId)` — full audit trail
- `updateStatus(orderId, status)`, `updatePaymentStatus(orderId, paymentStatus)`
- `findReorderItems(orderId)` — for reorder feature

## Order Service (`src/modules/order/services/order.service.ts`)

**Dependencies:** `IOrderRepository`, `IBranchChecker`

**Key methods:**
- `create(customerId, input)` — validates ordering enabled → calculates total → generates order number → creates order + items + timeline event
- `listMine(customerId)`, `getDetail(userId, orderId)`, `listByBranch(branchId, status?)`
- `accept(userId, orderId)`, `reject(userId, orderId, reason?)`, `updateStatus(userId, orderId, status)`
- `confirmPayment(userId, orderId)`, `rejectPayment(userId, orderId, reason?)`
- `getTimeline(orderId)`, `reorder(userId, orderId)`

**Status transitions (VALID_TRANSITIONS):**
```
placed    → [accepted, cancelled]
accepted  → [preparing, cancelled]
preparing → [ready, cancelled]
ready     → [completed, cancelled]
```

**BranchChecker** (`services/branch-checker.ts`): Queries `branch.isOrderingEnabled` before allowing order creation.

## Order DTOs (`src/modules/order/dtos/order.dto.ts`)

**CreateOrderInputSchema (Zod):**
- `branchId`, `orderType` ('dine-in' | 'pickup'), `customerName?`, `customerPhone?`, `tableNumber?`
- `specialInstructions?`, `paymentMethod?`, `items[]` (min 1)
- superRefine: pickup requires customerName + customerPhone

**Output DTOs:** `OrderDTO`, `CustomerOrderDTO`, `OrderItemDTO`, `TimelineEventDTO`, `ReorderResultDTO`

## Order Errors (`src/modules/order/errors/order.errors.ts`)

- `OrderNotFoundError` (404), `InvalidStatusTransitionError` (422)
- `BranchNotAcceptingOrdersError` (422), `OrderNotOwnedError` (422)

## Order Router (`src/modules/order/order.router.ts`)

**All procedures use `protectedProcedure`** (auth required):
- Customer: `create`, `listMine`, `getDetail`, `reorder`
- Owner: `listByBranch`, `accept`, `reject`, `updateStatus`, `confirmPayment`, `rejectPayment`, `getTimeline`

## Checkout Flow (`src/features/checkout/`)

- `CheckoutSheet` — drawer form with OrderTypeSelector, conditional fields, order summary
- `OrderConfirmationSheet` — success screen with order ID, nav to tracking/payment
- `OrderTypeSelector` — dine-in/pickup radio toggle

## Order Tracking (`src/features/order-tracking/`)

- `OrderStatusTracker` — vertical progress stepper (placed → accepted → preparing → ready → completed)
- `OrderDetails` — order summary with payment status badge

## Order Management (`src/features/order-management/`)

- `OrderDashboardTabs` — Inbox/Active/Completed/Cancelled tabs with badge counts
- `OrderRow` — order card with quick accept/reject for 'placed' orders
- `AcceptRejectActions` — accept button + reject dialog with reason
- `StatusUpdateDropdown` — advance status (accepted→preparing→ready→completed)
- `PaymentProofReview` — screenshot preview + confirm/reject
- `OrderDetail` — full detail page for staff
- `OrderTimeline` — audit trail display
- `useOrderManagement` hook — wraps all tRPC mutations with query invalidation

## Key Implications for v1 Modifications

1. **`order.create` uses `protectedProcedure`** — must change to `publicProcedure` with deviceSession validation for anonymous dine-in
2. **`customerId` is FK to auth.users** — will be nullable for anonymous orders; deviceSessionId becomes the identity
3. **`tableNumber` is plain text** — will need `tableSessionId` FK + `deviceSessionId` FK
4. **No idempotency key** — must add `idempotencyKey` column (unique) and dedup logic
5. **No ticket code** — must add `ticketCode` column (human-readable, e.g. "A-042") separate from orderNumber
6. **Order number format "ORD-XXXX"** — ticket code can coexist (different purpose: internal vs customer-facing)
7. **Checkout UI assumes auth** — must adapt for anonymous flow (no name/phone for dine-in, no order type selector)
8. **PaymentSheet/PaymentProofReview** — must be feature-flagged for v1
