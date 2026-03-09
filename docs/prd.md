# CravingsPH — Product Requirements Document

## Problem Statement

Philippine restaurant customers currently rely on fragmented methods to browse menus and place orders — printed menus, social media posts, phone calls, and walk-in ordering. There is no unified digital platform that lets customers scan a QR code, browse a menu, customize items, place an order, and pay — all from their phone. Restaurant owners have no self-service tools to manage their menus, receive digital orders, or accept payments online.

A legacy CravingsPH prototype validated the menu-browsing UX (category navigation, modifier system, smart cart merging) but never shipped ordering, payments, or restaurant self-service. A new codebase added authentication but has zero restaurant functionality. Neither version delivers a complete ordering loop.

## Solution

Build CravingsPH as a mobile-first restaurant ordering platform for the Philippines with two portals:

1. **Customer portal** — Browse restaurant menus via QR code or discovery, customize items with variants and modifiers, build a cart, place dine-in or pickup orders, and pay via GCash/Maya/bank transfer.
2. **Restaurant portal** — Self-service onboarding (organization → restaurant → branches → menu), order management dashboard, manual payment verification, team access with permissions.

The platform uses manual/offline payments (matching Philippine market behavior) where customers pay externally and upload proof, and restaurant owners verify payment before confirming orders. The architecture follows the KudosCourts reference (layered tRPC + Drizzle + Supabase Auth).

## User Stories

### Customer — Menu Browsing

1. As a customer, I want to scan a QR code at a restaurant and immediately see their menu, so that I can browse without downloading an app.
2. As a customer, I want to browse menu items organized by categories (e.g., "Chicken", "Drinks", "Desserts"), so that I can find what I want quickly.
3. As a customer, I want to search menu items by name within a restaurant, so that I can jump to a specific item.
4. As a customer, I want to see item details (name, description, image, price), so that I can make an informed choice.
5. As a customer, I want to see the restaurant's cover photo, profile picture, name, address, and contact info, so that I know where I am ordering from.
6. As a customer, I want horizontal-scroll category navigation with a sticky header, so that I can jump between sections without scrolling back to the top.

### Customer — Item Customization

7. As a customer, I want to select a variant for an item (e.g., Small/Medium/Large) that changes the base price, so that I can pick the right size.
8. As a customer, I want to add optional modifiers (e.g., extra cheese +₱25, no onions), so that I can customize my order.
9. As a customer, I want to see required modifier groups marked as "Required" and optional ones as "Optional", so that I know what I must choose.
10. As a customer, I want modifier groups with min/max selection rules (e.g., "pick 1 to 3 toppings"), so that the restaurant's constraints are enforced.
11. As a customer, I want to select a quantity before adding to cart, so that I can order multiples of the same item.
12. As a customer, I want to see the total price update live as I select variants and modifiers, so that I know the cost before adding to cart.

### Customer — Cart

13. As a customer, I want to add items to a running cart, so that I can build my full order before submitting.
14. As a customer, I want identical items (same variant + same modifiers) to merge automatically and increase quantity, so that my cart stays clean.
15. As a customer, I want to update quantities or remove items from my cart, so that I can adjust my order.
16. As a customer, I want to see an itemized breakdown with a running total including all modifier costs, so that I know exactly what I'm paying.
17. As a customer, I want my cart to persist across page refreshes (saved locally), so that I don't lose my selections if I accidentally close the browser.
18. As a customer, I want to see the cart icon with item count in the header, so that I always know how many items I've added.

### Customer — Ordering

19. As a customer, I want to place a dine-in order without creating an account, so that the process is frictionless.
20. As a customer, I want to place a pickup order by providing my name and phone number (guest checkout), so that the restaurant can contact me when it's ready.
21. As a customer, I want to choose between dine-in and pickup at checkout, so that the restaurant knows how to prepare my order.
22. As a customer, I want to provide a table number for dine-in orders (if the restaurant requires it), so that the staff knows where to deliver my food.
23. As a customer, I want to add special instructions to my order (e.g., "no ice", "extra napkins"), so that the restaurant can accommodate my preferences.
24. As a customer, I want to see an order confirmation screen with my order ID and next steps, so that I know my order was received.
25. As a customer, I want to receive real-time status updates on my order (placed → accepted → preparing → ready), so that I know when my food is ready.
26. As a customer, I want to receive push notifications when my order status changes, so that I don't have to keep checking the app.

### Customer — Payments

27. As a customer, I want to see the restaurant's accepted payment methods (GCash, Maya, bank) with account details, so that I know where to send money.
28. As a customer, I want copy-to-clipboard buttons for payment account numbers, so that I can transfer money quickly.
29. As a customer, I want to upload payment proof (reference number + optional screenshot) after paying, so that the restaurant can verify my payment.
30. As a customer, I want to see a payment countdown timer, so that I know how long I have to complete payment.
31. As a customer, I want the option to pay with cash at the counter (for dine-in), so that I don't have to use a digital wallet.

### Customer — Discovery

32. As a customer, I want to see a home page with nearby/featured restaurants, so that I can discover new places to eat.
33. As a customer, I want to search restaurants by name, so that I can find a specific place.
34. As a customer, I want to filter restaurants by cuisine type and location (province/city), so that I can narrow my options.
35. As a customer, I want to see restaurant cards with cover photo, name, cuisine tags, and a preview of popular items, so that I can decide which menu to browse.
36. As a customer, I want a "Scan QR" call-to-action on the home page, so that I can quickly open a restaurant's menu.
37. As a customer, I want to bookmark/save restaurants for later, so that I can return to my favorites.

### Customer — Order History & Retention

38. As a customer, I want to view my past orders (if I have an account), so that I can reorder my favorites.
39. As a customer, I want a "Reorder" button on past orders, so that I can quickly re-add the same items to my cart.
40. As a customer, I want to rate and review a restaurant after my order is completed, so that I can share my experience.
41. As a customer, I want to see ratings and reviews on restaurant pages, so that I can make informed choices.
42. As a customer, I want to receive promotional notifications from restaurants I've ordered from, so that I know about deals and new items.

### Restaurant Owner — Onboarding

43. As a restaurant owner, I want to register for an account and set my portal preference to "owner", so that I'm routed to the restaurant management dashboard.
44. As a restaurant owner, I want a setup wizard that guides me through creating my organization, adding a restaurant, and building my menu, so that I can go live step by step.
45. As a restaurant owner, I want to add my restaurant's basic info (name, address, city/province, phone, photos, description), so that customers can find me.
46. As a restaurant owner, I want to add multiple branches under my restaurant, so that each branch has its own menu and URL.
47. As a restaurant owner, I want to submit verification documents for admin review, so that my restaurant can go live on the platform.
48. As a restaurant owner, I want to see my verification status (pending/approved/rejected), so that I know where I stand.
49. As a restaurant owner, I want a hub view (non-linear alternative to the wizard), so that I can jump to any setup task directly.

### Restaurant Owner — Menu Management

50. As a restaurant owner, I want to create menu categories (e.g., "Main Course", "Drinks"), so that my menu is organized.
51. As a restaurant owner, I want to add menu items with name, description, image, and base price, so that customers can see what I offer.
52. As a restaurant owner, I want to define item variants (e.g., Small ₱99 / Medium ₱149 / Large ₱199), so that customers can choose sizes.
53. As a restaurant owner, I want to create modifier groups (e.g., "Choose your sauce") with min/max selection rules, so that item customization is structured.
54. As a restaurant owner, I want to add priced modifiers within groups (e.g., "Extra cheese +₱25"), so that add-ons affect the total.
55. As a restaurant owner, I want to reorder categories and items by drag-and-drop, so that I control the menu layout.
56. As a restaurant owner, I want to mark items as "sold out" temporarily, so that customers don't order unavailable items.
57. As a restaurant owner, I want to search, filter, and sort my menu items in a grid/list view, so that I can manage a large menu efficiently.
58. As a restaurant owner, I want to upload images for menu items (with drag-and-drop and preview), so that my menu is visually appealing.

### Restaurant Owner — Order Management

59. As a restaurant owner, I want to see incoming orders in a dashboard with tabs (Inbox / Active / Completed / Cancelled), so that I can manage my workflow.
60. As a restaurant owner, I want to receive push notifications when a new order arrives, so that I can respond quickly.
61. As a restaurant owner, I want to accept or reject incoming orders with an optional reason, so that I have control over what I fulfill.
62. As a restaurant owner, I want to configure my restaurant for auto-accept mode, so that orders are confirmed instantly without manual action.
63. As a restaurant owner, I want to update order status (accepted → preparing → ready → completed), so that customers know the progress.
64. As a restaurant owner, I want to see order details (items, quantities, modifiers, special instructions, customer contact), so that I can prepare the order correctly.
65. As a restaurant owner, I want to view daily/weekly order summaries, so that I can track my business volume.

### Restaurant Owner — Payments

66. As a restaurant owner, I want to configure my accepted payment methods (GCash number, Maya number, bank account details), so that customers know where to pay.
67. As a restaurant owner, I want to add multiple payment methods and set one as default, so that customers see my preferred method first.
68. As a restaurant owner, I want to review payment proof (reference number, screenshot) submitted by customers, so that I can verify before confirming.
69. As a restaurant owner, I want to confirm or reject payment for each order, so that I maintain control over payment verification.
70. As a restaurant owner, I want a "Mark as Paid (Cash)" shortcut for dine-in orders paid at the counter, so that I can quickly confirm walk-in payments.

### Restaurant Owner — Team Access

71. As a restaurant owner, I want to invite team members (staff, managers) by email, so that they can help manage my restaurant.
72. As a restaurant owner, I want to assign roles (Manager / Viewer) with granular permissions, so that staff only access what they need.
73. As a restaurant owner, I want managers to be able to accept/reject orders, update statuses, and manage the menu, so that I can delegate operations.
74. As a restaurant owner, I want viewers to have read-only access to orders, so that front-of-house staff can check order status.
75. As a restaurant owner, I want to revoke team member access at any time, so that I can control who has access.

### Restaurant Owner — Settings & Configuration

76. As a restaurant owner, I want to set operating hours per branch, so that customers know when I'm open.
77. As a restaurant owner, I want to configure order acceptance mode (manual vs auto-accept) per branch, so that I can choose what works for my workflow.
78. As a restaurant owner, I want to set a payment countdown duration, so that I can control how long customers have to pay.
79. As a restaurant owner, I want to generate a QR code for each branch, so that I can display it in my restaurant for customers to scan.
80. As a restaurant owner, I want to toggle online ordering on/off per branch, so that I can temporarily pause receiving orders.

### Admin — Platform Operations

81. As a platform admin, I want to review restaurant verification submissions (documents, business permits), so that I can approve or reject listings.
82. As a platform admin, I want to see a list of all restaurants with their verification status, so that I can track onboarding progress.
83. As a platform admin, I want to manage restaurant data (edit, deactivate, feature), so that I can maintain platform quality.
84. As a platform admin, I want to view platform-wide order statistics, so that I can track growth.
85. As a platform admin, I want to manage user accounts (view, deactivate), so that I can handle support cases.

## Implementation Decisions

### Architecture

- Follow the KudosCourts reference architecture: 5-layer (App Router → Features → Common → Domain Modules → Shared/Kernel) with factory-based DI, tRPC routers, Drizzle repositories, and Feature API classes.
- Copy the `ph-provinces-cities` route and data file from KudosCourts for location search.
- Client conformance rules will be enforced via the same `check-client-conformance.sh` pattern.

### Data Model — Organization Hierarchy

- **Organization** → **Restaurant** → **Branch** (mirrors KudosCourts' Organization → Venue → Court pattern)
- Each branch has its own URL slug, menu, operating hours, and order queue
- One organization can have multiple restaurants, each with multiple branches
- Restaurant = brand entity (e.g., "Jollibee"), Branch = physical location (e.g., "Jollibee Makati")

### Data Model — Menu

- **Category** belongs to a Branch, has `name`, `sortOrder`
- **MenuItem** belongs to a Category, has `name`, `description`, `image`, `basePrice`, `isAvailable`, `sortOrder`
- **ItemVariant** belongs to a MenuItem, has `name`, `price`, `sortOrder` (e.g., Small ₱99, Large ₱149)
- **ModifierGroup** belongs to a MenuItem, has `name`, `isRequired`, `minSelections`, `maxSelections`, `sortOrder`
- **Modifier** belongs to a ModifierGroup, has `name`, `price`, `sortOrder`
- All IDs are UUIDs, all timestamps are `timestamptz`

### Data Model — Orders

- **Order** has `branchId`, `status`, `orderType` (dine-in/pickup), `customerName`, `customerPhone`, `tableNumber`, `specialInstructions`, `subtotal`, `total`
- **OrderItem** has `orderId`, `menuItemId`, `variantId`, `quantity`, `unitPrice`, `itemTotal`
- **OrderItemModifier** has `orderItemId`, `modifierId`, `price`
- Status lifecycle: `CREATED → ACCEPTED → PREPARING → READY → COMPLETED` (happy path), with `CANCELLED` and `EXPIRED` branches
- For auto-accept restaurants: `CREATED → PREPARING → READY → COMPLETED` (skips ACCEPTED)

### Payments

- Manual/offline payments matching the Philippine market (same as KudosCourts)
- Payment methods configured per organization: GCash, Maya, bank account (BPI, BDO, etc.)
- Customer pays externally → uploads proof (reference number + optional screenshot) → owner verifies
- Cash payment shortcut for dine-in: owner marks as "Paid (Cash)" directly
- Payment countdown timer configurable per restaurant
- No in-platform payment processing, no platform commission (initially)

### Authentication & Authorization

- Fully anonymous menu browsing and cart building (no account required)
- Guest checkout: customer provides name + phone number only
- Optional account creation for order history, reordering, favorites
- Restaurant owners require account with "owner" portal preference
- Role-based access: Owner (full access), Manager (operational), Viewer (read-only)
- 7 granular permissions modeled after KudosCourts

### Order Acceptance Mode

- Configurable per restaurant branch
- **Manual mode**: Owner reviews and accepts/rejects each order
- **Auto-accept mode**: Orders are automatically accepted and move to PREPARING
- Owners can toggle between modes in branch settings

### Real-Time Updates

- Supabase Realtime subscriptions for live order status on the customer's screen
- Push notifications (web push) for status change events
- In-app notification inbox for restaurant owners (like KudosCourts)
- Notification routing: owner + opted-in team members receive order notifications

### Restaurant Onboarding

- Setup wizard (linear, 7 steps) + hub view (non-linear, card grid) — same dual-mode as KudosCourts
- Steps: Create Org → Add Restaurant → Add Branch → Build Menu → Payment Methods → Verification → Complete
- Admin approval required before restaurant goes live
- Verification: owner uploads proof-of-ownership documents → admin reviews

### Discovery

- Home page: hero search, cuisine category shortcuts, featured restaurants, "Scan QR" CTA
- Restaurant browse: paginated list with filters (province/city, cuisine type)
- Province/city data from `ph-provinces-cities.enriched.json` (copied from KudosCourts)
- Restaurant pages use SSR with ISR for SEO (same `generateStaticParams` pattern as KudosCourts)

### Customer-Facing Design

- Pill-shaped buttons, inputs, badges (`shape="pill"` variant)
- Orange brand color `#f86006` for prices, CTAs, active states
- Bottom-sheet patterns for item details, cart, checkout
- Full-bleed food photography, generous whitespace
- Mobile-first (390pt design width), responsive desktop support

### Phased Delivery

| Phase | Scope | Depends On |
|-------|-------|------------|
| 1 | Menu browsing + cart (customer) | — |
| 2 | Restaurant onboarding + menu management (owner) | — |
| 3 | Ordering + checkout (customer + owner) | 1, 2 |
| 4 | Order management dashboard (owner) | 3 |
| 5 | Payments (manual/offline) | 3, 4 |
| 6 | Discovery + home page | 1 |
| 7 | Retention (history, reorder, reviews, notifications, favorites) | 3 |

## Testing Decisions

### What Makes a Good Test

- Tests verify external behavior, not implementation details
- Tests should be resilient to refactoring — if the interface doesn't change, tests shouldn't break
- Tests use realistic inputs and assert on outputs, not internal method calls
- Domain services are the primary test surface (they contain business logic with clear interfaces)

### Modules to Test

| Module | Why | Test Type |
|--------|-----|-----------|
| Cart store (Zustand) | Smart merging, quantity logic, price calculation | Unit (Vitest) |
| Order service | Status transitions, validation, auto-accept logic | Unit (Vitest) |
| Menu service | Category/item CRUD, variant/modifier rules | Unit (Vitest) |
| Payment service | Proof submission, verification flow, expiration | Unit (Vitest) |
| Price calculation | Variant + modifier pricing, cart totals | Unit (Vitest) |
| Order lifecycle | Full flow from CREATED to COMPLETED | Integration (Vitest) |
| Restaurant onboarding wizard | Multi-step flow completion | E2E (Playwright) |
| Customer ordering flow | Browse → cart → checkout → payment | E2E (Playwright) |

### Prior Art

- KudosCourts boilerplate has unit tests in `src/__tests__/` mirroring the source tree
- Vitest with jsdom environment, `server-only` shimmed
- `restoreMocks: true`, `clearMocks: true` — no mock leakage
- Service-level tests mock only the repository layer

## Out of Scope

- **Bill splitting** — Designed in Figma (~20 screens) but deferred. Will be a separate PRD when the core ordering loop is stable.
- **In-platform payment processing** — No Stripe/GCash API integration. All payments are manual/offline.
- **Platform commission/transaction fees** — No revenue model in the initial release.
- **Delivery orders** — Only dine-in and pickup. Delivery requires address management, fee calculation, driver assignment.
- **SEO guide pages** — Content marketing pages deferred to Phase 6+.
- **Native mobile app** — PWA-first. Native apps may come later.
- **Multi-language support** — English only at launch. Filipino/Tagalog localization deferred.
- **Loyalty programs / promotions** — Deferred to retention phase.
- **Analytics dashboard for owners** — Basic order counts only. Full analytics deferred.
- **Automated payment verification** — No bank/wallet API integration for auto-confirming payments.
- **Chat/messaging between customer and restaurant** — Deferred. Phone number is the contact method.

## Further Notes

- The legacy CravingsPH validated that the modifier system (required/optional groups with min/max rules and priced add-ons) covers real restaurant needs. The new schema adds item variants as a first-class concept on top of this.
- The manual payment model is intentional and matches Philippine market behavior (GCash screenshots are the norm). Automated payment integration is a future opportunity but not required for market entry.
- The KudosCourts codebase at `/Users/raphaelm/Documents/Coding/boilerplates/next16bp/` serves as the canonical reference for all architecture patterns. Key reference files are documented in `docs/reference-architecture/overview.md`.
- The `ph-provinces-cities` route and enriched JSON file should be copied from the boilerplate to support location-based discovery and restaurant address entry.
- The organization → restaurant → branch hierarchy supports future features like chain management, franchise dashboards, and cross-branch analytics without schema changes.
