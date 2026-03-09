# Frontend UI Scaffold — Implementation Plan

## Checklist

- [ ] Step 1: Shared foundations (brand components, layout shells, route groups)
- [ ] Step 2: Customer shell + restaurant page (menu browsing — Phase 1)
- [ ] Step 3: Cart system (store + drawer + floating button — Phase 1)
- [ ] Step 4: Checkout + order confirmation (Phase 3)
- [ ] Step 5: Payment flow (Phase 5)
- [ ] Step 6: Order tracking page (Phase 3)
- [ ] Step 7: Discovery + home page (Phase 6)
- [ ] Step 8: Auth pages + owner registration (Phase 2)
- [ ] Step 9: Owner layout + sidebar + dashboard (Phase 2)
- [ ] Step 10: Owner onboarding — hub + wizard (Phase 2)
- [ ] Step 11: Owner menu management (Phase 2)
- [ ] Step 12: Owner order management (Phase 4)
- [ ] Step 13: Owner payments + team + settings (Phase 2/5)
- [ ] Step 14: Admin portal (all admin pages)
- [ ] Step 15: Customer retention pages (Phase 7)
- [ ] Step 16: Polish — loading states, error boundaries, responsive tweaks

---

## Step 1: Shared Foundations

**Objective:** Establish the route group structure, layout shells, and shared brand components that all subsequent steps depend on.

**Implementation guidance:**

1. Create route group directories with layout files:
   - `src/app/(public)/layout.tsx` → `CustomerShell` (mobile header: Logo left, cart icon right)
   - `src/app/(auth)/layout.tsx` → `AuthShell` (centered card container)
   - `src/app/(owner)/layout.tsx` → `DashboardShell` wrapper with `requireSession()` + org gate
   - `src/app/(admin)/layout.tsx` → `DashboardShell` wrapper with `requireAdminSession()`

2. Create shared brand components:
   - `src/components/brand/back-button.tsx` — circular back arrow (from legacy)
   - `src/components/brand/cover-image.tsx` — responsive Next.js Image wrapper with height prop
   - `src/components/brand/empty-state.tsx` — peach bg + message + optional CTA
   - `src/components/brand/required-badge.tsx` — orange pill "Required"
   - `src/components/brand/optional-badge.tsx` — orange outline "Optional"

3. Create layout components:
   - `src/components/layout/customer-shell.tsx` — mobile header + main content
   - `src/components/layout/customer-header.tsx` — Logo, optional cart icon, optional auth link
   - `src/components/layout/dashboard-shell.tsx` — SidebarProvider + SidebarInset (adapt from reference)
   - `src/components/layout/dashboard-navbar.tsx` — breadcrumbs + page actions slot

4. Create route configuration:
   - `src/common/app-routes.ts` — all route paths as typed constants with helper functions
   - Route type classification: `getRouteType(pathname)`

5. Move existing auth pages into `(auth)` route group (currently in `(auth)` already — verify structure matches)

**Test requirements:**
- Route groups render correct layouts
- Auth guards redirect correctly (owner → login, admin → login)
- Brand components render with correct styling

**Integration notes:**
- Existing `(auth)` and `(protected)` route groups need restructuring to match new pattern
- `(protected)` group is replaced by `(owner)` — migrate dashboard page
- Existing providers.tsx stays in root layout

**Demo:** Navigate to each route group and see the correct shell. Auth guards redirect unauthenticated users.

---

## Step 2: Customer Shell + Restaurant Page

**Objective:** Rebuild the core menu browsing experience from legacy with the new category tabs improvement.

**Implementation guidance:**

1. Create the restaurant page route:
   - `src/app/(public)/restaurant/[slug]/page.tsx` — SSR, fetches branch + menu via tRPC
   - `src/app/(public)/restaurant/[slug]/loading.tsx` — skeleton (cover image placeholder + category pills + item cards)

2. Create restaurant header components:
   - `src/features/menu/components/restaurant-header.tsx` — cover image + profile picture + info
   - `src/features/menu/components/copy-contact-button.tsx` — phone copy with tooltip feedback

3. Create category navigation:
   - `src/features/menu/components/category-tabs.tsx` — horizontal ScrollArea with pill Buttons, sticky positioning, scroll-to-section on tap, IntersectionObserver for auto-highlighting active category as user scrolls

4. Create menu display:
   - `src/features/menu/components/menu-section-list.tsx` — renders categories with section headings (id for scroll targets)
   - `src/features/menu/components/menu-item-card.tsx` — image, name, description, `<Price />`, quick-add button
   - `src/features/menu/components/quick-add-button.tsx` — orange "+" circle

5. Create item customization sheet:
   - `src/features/menu/components/menu-item-sheet.tsx` — Drawer (bottom), supports `mode: 'add' | 'edit'`
   - `src/features/menu/components/modifier-group.tsx` — RadioGroup or Checkbox group based on min/max
   - `src/features/menu/components/modifier-option.tsx` — label + price
   - `src/features/menu/components/quantity-picker.tsx` — reusable +/- control

6. Create search:
   - `src/features/menu/components/menu-search-sheet.tsx` — Drawer (top or full), Input shape="pill", filtered item results

7. Create hooks:
   - `src/features/menu/hooks/use-sheet-state.ts` — generic `useSheetState<T>()` replacing legacy duplicates
   - `src/features/menu/hooks/use-category-observer.ts` — IntersectionObserver for active category tracking

**Test requirements:**
- Restaurant page renders with SSR data
- Category tabs scroll to correct section
- Item sheet shows correct modifiers for item
- Required modifier validation prevents add-to-cart without selection
- Search filters items correctly

**Integration notes:**
- Page fetches data via existing `menu.getPublicMenu` and `restaurant.getBySlug` tRPC procedures
- Components receive data as props (no direct store access in display components)
- `notFound()` for invalid slugs

**Demo:** Navigate to `/restaurant/test-slug`, see restaurant header, browse categories via horizontal tabs, tap item to open customization sheet, select modifiers, see live price update.

---

## Step 3: Cart System

**Objective:** Build the cart store, cart drawer, floating button, and inline quantity pickers — completing the Phase 1 loop.

**Implementation guidance:**

1. Create cart store:
   - `src/features/cart/stores/cart.store.ts` — Zustand with persist middleware
   - Smart item merging (same menuItemId + variant + modifiers → increase quantity)
   - Branch scoping: store `branchSlug`, prompt if adding from different branch
   - Selectors: `useCartItems()`, `useCartTotal()`, `useCartItemCount()`, `useCartBranch()`

2. Create cart UI:
   - `src/features/cart/components/cart-floating-button.tsx` — fixed bottom, orange pill, shows count + total, triggers drawer
   - `src/features/cart/components/cart-drawer.tsx` — Drawer (bottom), lists items with edit/remove
   - `src/features/cart/components/cart-item.tsx` — image, name, selected modifiers, quantity picker, price
   - `src/features/cart/components/cart-summary.tsx` — subtotal, item count

3. Create inline quantity picker:
   - `src/features/menu/components/inline-quantity-picker.tsx` — shows on menu item cards when item is in cart
   - Auto-hide behavior via `useAutoHide(timeout)` hook

4. Wire cart to menu item sheet:
   - "Add to cart" button calls `cart.addItem()`
   - Edit mode pre-populates from cart item, "Update" calls `cart.updateItem()`

**Test requirements:**
- Adding identical items merges correctly
- Cart persists across page refresh
- Removing last item hides floating button
- Branch switch prompts cart clear
- Cart total calculates correctly (base + variant + modifiers × quantity)

**Integration notes:**
- Cart store is client-only (Zustand + localStorage)
- Cart floating button rendered in CustomerShell (visible across all public pages)
- Menu item sheet receives `onAddToCart` / `onUpdateCartItem` callbacks

**Demo:** Add items to cart via quick-add and sheet, see floating button appear with count, open cart drawer, edit quantities, see total update.

---

## Step 4: Checkout + Order Confirmation

**Objective:** Build the adaptive checkout sheet and order confirmation, connecting cart to the ordering system.

**Implementation guidance:**

1. Create checkout sheet:
   - `src/features/checkout/components/checkout-sheet.tsx` — Drawer triggered from cart drawer's "Checkout" button
   - `src/features/checkout/components/order-type-selector.tsx` — RadioGroup: dine-in / pickup
   - Adaptive form: dine-in shows table number; pickup adds name + phone
   - Special instructions textarea (both types)
   - Readonly cart summary at top
   - "Place Order ₱{total}" button at bottom

2. Create order confirmation:
   - `src/features/checkout/components/order-confirmation-sheet.tsx` — success state after order placement
   - Shows order ID, next steps (payment instructions or "wait for your order")
   - "View Order Status" button → navigates to tracking page
   - "Upload Payment Proof" button → opens payment sheet

3. Create checkout hook:
   - `src/features/checkout/hooks/use-checkout.ts` — manages form state, submission, loading
   - Calls `order.create` tRPC mutation
   - Clears cart on success

**Test requirements:**
- Dine-in form shows only table number + instructions
- Pickup form shows name + phone + instructions
- Form validation: phone required for pickup, name required for pickup
- Order creation calls tRPC with correct payload
- Cart clears after successful order

**Integration notes:**
- Requires `order.create` tRPC procedure (may need to be created in modules)
- Checkout sheet opens from cart drawer — nested drawers
- On success, navigates to order tracking page

**Demo:** From cart, tap "Checkout", select dine-in, enter table number, place order, see confirmation with order ID.

---

## Step 5: Payment Flow

**Objective:** Build payment method display and proof upload for the manual/offline payment model.

**Implementation guidance:**

1. Create payment sheet:
   - `src/features/payment/components/payment-sheet.tsx` — Drawer, shown after order confirmation or from order tracking
   - `src/features/payment/components/payment-countdown.tsx` — countdown timer with Progress bar
   - `src/features/payment/components/payment-method-card.tsx` — Card showing method type, account name, account number with copy button
   - `src/features/payment/components/payment-proof-form.tsx` — reference number input + optional screenshot upload + submit button
   - Cash option: "Pay with Cash at Counter" button (dine-in only)

2. Wire to order tracking:
   - Payment sheet accessible from order tracking page
   - Payment status shown on tracking page (pending / submitted / confirmed / rejected)

**Test requirements:**
- Payment methods display from restaurant config
- Copy button copies account number to clipboard
- Countdown timer counts down from configured minutes
- Payment proof form validates reference number
- Cash option only shows for dine-in orders

**Integration notes:**
- Payment methods fetched via `branch.getBySlug` (payment config on branch/org)
- Payment proof submission via `order.submitPaymentProof` tRPC mutation
- File upload uses Supabase Storage

**Demo:** After placing order, see payment methods with copy buttons, enter reference number, submit proof, see status update to "submitted."

---

## Step 6: Order Tracking Page

**Objective:** Build the real-time order status page with Supabase Realtime.

**Implementation guidance:**

1. Create tracking page:
   - `src/app/(public)/restaurant/[slug]/order/[orderId]/page.tsx` — client component
   - `src/features/order-tracking/components/order-status-tracker.tsx` — vertical timeline with status steps
   - `src/features/order-tracking/components/status-step.tsx` — individual step (completed/current/upcoming states)
   - `src/features/order-tracking/components/order-details.tsx` — readonly order items + total

2. Real-time updates:
   - Subscribe to Supabase Realtime on `orders` table filtered by `orderId`
   - Update status tracker on change
   - Show toast on status transitions

3. Payment status section:
   - Badge showing payment status
   - Button to open payment sheet if not yet paid

**Test requirements:**
- Page loads with current order status
- Status updates in real-time without refresh
- Completed orders show all steps as done
- Payment proof can be submitted from tracking page

**Integration notes:**
- Uses `order.status` tRPC query for initial load
- Supabase Realtime subscription for live updates
- Page is accessible without auth (order ID is the access token)

**Demo:** Open order tracking page, see status at "Preparing", wait for owner to update, see "Ready" appear in real-time with toast.

---

## Step 7: Discovery + Home Page

**Objective:** Build the customer discovery experience — home page, search, and restaurant browsing.

**Implementation guidance:**

1. Create home page:
   - `src/app/(public)/page.tsx` — discovery landing
   - `src/features/discovery/components/hero-section.tsx` — peach bg, Logo, "Craving for something?", search input
   - `src/features/discovery/components/cuisine-pill.tsx` — category shortcut buttons
   - `src/features/discovery/components/restaurant-card.tsx` — cover image, name, cuisine tags, popular items preview
   - `src/features/discovery/components/restaurant-card-list.tsx` — horizontal scroll (featured) + vertical (nearby)
   - `src/features/discovery/components/scan-qr-cta.tsx` — fixed bottom orange pill button

2. Create search page:
   - `src/app/(public)/search/page.tsx` — search results with filters
   - `src/features/discovery/components/location-filter.tsx` — province → city Select (from ph-provinces-cities data)
   - `src/features/discovery/components/cuisine-filter.tsx` — horizontal pills for cuisine types
   - Paginated restaurant list

3. Create save/bookmark:
   - `src/features/discovery/components/save-button.tsx` — heart icon toggle on restaurant cards

**Test requirements:**
- Home page renders featured and nearby restaurants
- Search filters by name, cuisine, and location
- Restaurant cards link to `/restaurant/[slug]`
- Save button toggles (requires auth)

**Integration notes:**
- Requires `restaurant.listFeatured`, `restaurant.search` tRPC procedures
- Province/city data from `ph-provinces-cities.enriched.json` (copy from reference repo)
- Restaurant pages use SSR with ISR for SEO

**Demo:** Land on home page, see featured restaurants, search for "chicken", filter by Makati, tap restaurant card to navigate to menu.

---

## Step 8: Auth Pages + Owner Registration

**Objective:** Set up auth pages in the `(auth)` route group with separate customer and owner registration flows.

**Implementation guidance:**

1. Restructure existing auth:
   - Move existing login/register/magic-link pages into `(auth)` group (may already be there)
   - Verify `AuthShell` layout renders correctly

2. Create owner registration:
   - `src/app/(auth)/register/owner/page.tsx` — dedicated owner registration
   - Same auth fields (email, password) + organization name field
   - On success → redirect to `/organization/get-started`

3. Update post-login redirect:
   - `src/app/(auth)/post-login/route.ts` — check user role/profile preference
   - Customer → `/` (home)
   - Owner → `/organization`
   - Admin → `/admin`

**Test requirements:**
- Customer registration → redirect to home
- Owner registration → creates org + redirect to get-started
- Login routes to correct portal based on user type
- Magic link works for both customer and owner

**Integration notes:**
- Existing auth module handles registration
- Owner registration additionally calls `organization.create`
- Post-login route reads profile to determine redirect target

**Demo:** Register as owner, get redirected to onboarding hub. Register as customer, get redirected to home.

---

## Step 9: Owner Layout + Sidebar + Dashboard

**Objective:** Build the owner portal shell with sidebar navigation and dashboard overview.

**Implementation guidance:**

1. Create owner layout:
   - `src/app/(owner)/layout.tsx` — `requireSession()`, fetch orgs, redirect to get-started if none
   - Wrap children in `DashboardShell`

2. Create owner sidebar:
   - `src/features/owner/components/owner-sidebar.tsx` — following reference repo pattern
   - SidebarHeader: org name + role badge
   - Nav groups: Setup, Overview, Restaurants (collapsible hierarchy), Orders (with badge), Finance, Organization, Account
   - Permission-based filtering via `PageAccessRule`
   - `src/features/owner/components/owner-nav-items.ts` — static nav config array

3. Create owner dashboard:
   - `src/app/(owner)/organization/page.tsx` — overview page
   - Stat cards: total orders today, pending orders, active branches, revenue today
   - Quick links to common actions

4. Create sidebar data hooks:
   - `src/features/owner/hooks/use-owner-sidebar-data.ts` — fetches restaurants + branches for hierarchy
   - `src/features/owner/hooks/use-owner-permission-context.ts` — combines org + role + permissions

**Test requirements:**
- Unauthenticated → redirect to login
- No org → redirect to get-started
- Sidebar shows correct nav items based on role
- Restaurant → Branch hierarchy renders correctly
- Active route highlighted in sidebar

**Integration notes:**
- Uses existing `organization.mine` tRPC procedure
- Needs `restaurant.listByOrganization` and `branch.listByRestaurant` for sidebar hierarchy
- Badge count from `order.pendingCount` (to be created)

**Demo:** Log in as owner, see dashboard with sidebar, navigate via sidebar, see restaurant → branch hierarchy expand.

---

## Step 10: Owner Onboarding — Hub + Wizard

**Objective:** Build both onboarding modes for new restaurant owners.

**Implementation guidance:**

1. Create hub page:
   - `src/app/(owner)/organization/get-started/page.tsx`
   - `src/features/onboarding/components/setup-card.tsx` — icon, title, description, status badge
   - Grid of 7 setup cards, each linking to the relevant section or wizard step
   - Progress overview: "X of 7 complete"

2. Create wizard page:
   - `src/app/(owner)/organization/onboarding/page.tsx`
   - `src/features/onboarding/components/wizard-progress.tsx` — step indicator
   - `src/features/onboarding/components/wizard-step.tsx` — renders step content
   - Step forms: OrganizationForm, RestaurantForm, BranchForm, MenuBuilder, PaymentMethodForm, VerificationUpload, CompletionStep
   - Wizard state: current step stored in URL search params (`?step=3`)

3. Create reusable entity forms:
   - `src/features/onboarding/components/organization-form.tsx` — name, description, logo
   - `src/features/onboarding/components/restaurant-form.tsx` — name, cuisine, address, photos
   - `src/features/onboarding/components/branch-form.tsx` — name, address, province/city, phone
   - These forms are reused by the standalone CRUD pages later

**Test requirements:**
- Hub shows correct completion status per step
- Wizard progresses through all 7 steps
- Each step persists data before advancing
- Back button returns to previous step
- Completion redirects to dashboard

**Integration notes:**
- Uses `organization.create`, `restaurant.create`, `branch.create` mutations
- Setup status derived from querying each entity's existence
- Province/city selects from `ph-provinces-cities` data

**Demo:** New owner lands on hub, clicks "Start Wizard", completes all 7 steps, redirected to dashboard with full sidebar.

---

## Step 11: Owner Menu Management

**Objective:** Build the CRUD interface for managing categories, items, variants, and modifiers.

**Implementation guidance:**

1. Create menu management page:
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/menu/page.tsx`
   - Category tabs + search + sort controls
   - Grid/table view of menu items per category

2. Create CRUD dialogs:
   - `src/features/menu-management/components/add-category-dialog.tsx`
   - `src/features/menu-management/components/add-item-dialog.tsx` — form + image upload + category select
   - `src/features/menu-management/components/edit-item-dialog.tsx`
   - `src/features/menu-management/components/variants-dialog.tsx` — dynamic rows (name + price)
   - `src/features/menu-management/components/modifier-group-dialog.tsx` — group config + modifier rows

3. Create management components:
   - `src/features/menu-management/components/menu-item-card.tsx` — image, name, price, availability Switch, actions DropdownMenu
   - `src/features/menu-management/components/image-upload.tsx` — drag-drop + preview

4. Availability toggle:
   - Switch component inline on each item card
   - Optimistic update via `menu.updateItem` mutation

**Test requirements:**
- CRUD operations for categories, items, variants, modifiers
- Image upload shows preview
- Availability toggle updates immediately
- Sort and filter work correctly
- Validation on required fields

**Integration notes:**
- Uses existing `menu.*` tRPC procedures (create/update/delete for all entities)
- Image upload via Supabase Storage
- Optimistic updates with TanStack Query mutation hooks

**Demo:** Navigate to branch menu, add category "Drinks", add item "Iced Coffee" with variant sizes and modifier groups, toggle availability.

---

## Step 12: Owner Order Management

**Objective:** Build the order dashboard with tabbed views and order detail pages.

**Implementation guidance:**

1. Create order dashboard:
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/orders/page.tsx`
   - `src/features/order-management/components/order-dashboard-tabs.tsx` — Inbox (badge), Active, Completed, Cancelled
   - `src/features/order-management/components/order-row.tsx` — order summary row with actions

2. Create order detail:
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/orders/[orderId]/page.tsx`
   - `src/features/order-management/components/order-detail.tsx` — full order info
   - `src/features/order-management/components/payment-proof-review.tsx` — view proof + confirm/reject
   - `src/features/order-management/components/order-timeline.tsx` — status change history
   - `src/features/order-management/components/accept-reject-actions.tsx` — with AlertDialog confirmation
   - `src/features/order-management/components/status-update-dropdown.tsx` — advance status

3. Real-time:
   - Supabase Realtime subscription for new orders (Inbox tab)
   - Toast notification on new order arrival
   - Badge count updates live

**Test requirements:**
- Tabs filter orders by status
- Accept moves order from Inbox to Active
- Reject moves to Cancelled with reason
- Status update advances through lifecycle
- Payment confirm/reject updates order
- New orders appear in real-time

**Integration notes:**
- Requires `order.listByBranch`, `order.accept`, `order.reject`, `order.updateStatus`, `order.confirmPayment`, `order.rejectPayment` procedures
- Real-time via Supabase subscription on `orders` table filtered by `branchId`

**Demo:** View orders in Inbox, accept one, update status to Preparing → Ready, review payment proof, confirm payment, mark complete.

---

## Step 13: Owner Payments + Team + Settings

**Objective:** Build remaining owner portal pages — payment config, team management, branch settings.

**Implementation guidance:**

1. Payment config:
   - `src/app/(owner)/organization/payments/page.tsx`
   - `src/features/payment-config/components/payment-method-card.tsx`
   - `src/features/payment-config/components/add-payment-method-dialog.tsx`
   - CRUD for GCash/Maya/Bank methods, set default

2. Team management:
   - `src/app/(owner)/organization/team/page.tsx`
   - `src/features/team/components/team-table.tsx` — members with role badges
   - `src/features/team/components/invite-dialog.tsx` — email + role select
   - Change role and revoke access actions

3. Branch settings:
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/settings/page.tsx`
   - `src/features/branch-settings/components/weekly-hours-editor.tsx`
   - `src/features/branch-settings/components/qr-code-preview.tsx` — generate + download
   - Order settings: online ordering toggle, auto-accept toggle, payment countdown input

4. Verification:
   - `src/app/(owner)/organization/verify/page.tsx`
   - Document upload form + status display

5. Restaurant/Branch CRUD pages:
   - `src/app/(owner)/organization/restaurants/page.tsx` — list
   - `src/app/(owner)/organization/restaurants/[restaurantId]/page.tsx` — edit
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/page.tsx` — list
   - `src/app/(owner)/organization/restaurants/[restaurantId]/branches/[branchId]/page.tsx` — edit
   - Reuse forms from onboarding (RestaurantForm, BranchForm)

**Test requirements:**
- Payment methods CRUD with default selection
- Team invite sends email, member appears in table
- Role change updates permissions immediately
- Branch settings save correctly
- QR code generates valid URL

**Integration notes:**
- Payment config via `organization.updatePaymentMethods` (or dedicated payment module)
- Team via `team.invite`, `team.updateRole`, `team.revoke` procedures
- QR code generation client-side (use `qrcode` library)

**Demo:** Add GCash payment method, invite team member as Manager, set branch hours, generate and download QR code.

---

## Step 14: Admin Portal

**Objective:** Build the admin dashboard, verification queue, and management pages.

**Implementation guidance:**

1. Create admin layout + sidebar:
   - `src/app/(admin)/layout.tsx` — `requireAdminSession()` + DashboardShell
   - `src/features/admin/components/admin-sidebar.tsx` — flat nav with badge counts
   - Nav items: Dashboard, Verification (badge), Restaurants, Users

2. Create admin dashboard:
   - `src/app/(admin)/admin/page.tsx` — stat cards (restaurants, verifications pending, orders today, users)

3. Create verification queue:
   - `src/app/(admin)/admin/verification/page.tsx` — list of pending verification requests
   - `src/app/(admin)/admin/verification/[requestId]/page.tsx` — review documents + approve/reject
   - Show uploaded documents, restaurant info, owner info

4. Create restaurant management:
   - `src/app/(admin)/admin/restaurants/page.tsx` — all restaurants with status filter
   - `src/app/(admin)/admin/restaurants/[id]/page.tsx` — admin view/edit, feature toggle, deactivate

5. Create user management:
   - `src/app/(admin)/admin/users/page.tsx` — user list with search, deactivate action

**Test requirements:**
- Admin guard blocks non-admin users
- Verification approve/reject updates restaurant status
- Restaurant management filters by status
- User deactivation works

**Integration notes:**
- Requires admin-specific tRPC procedures (verification, restaurant management, user management)
- Admin procedures use `protectedProcedure` with admin role check

**Demo:** Log in as admin, see pending verifications on dashboard, review a restaurant, approve it, see status change.

---

## Step 15: Customer Retention Pages

**Objective:** Build order history, reorder, saved restaurants, and reviews.

**Implementation guidance:**

1. Order history:
   - `src/app/(public)/orders/page.tsx` — conditional auth, redirect to login if not authenticated
   - `src/features/orders/components/order-history-card.tsx` — restaurant, date, items summary, total, status, "Reorder" button

2. Reorder:
   - "Reorder" button adds all items from past order to cart
   - Navigate to restaurant page with cart populated
   - Handle unavailable items gracefully (toast warning)

3. Saved restaurants:
   - `src/app/(public)/saved/page.tsx` — conditional auth
   - Vertical list of saved RestaurantCards with unsave action

4. Reviews:
   - `src/features/orders/components/review-sheet.tsx` — Drawer with star rating + text review
   - Accessible from completed order history cards
   - Display reviews on restaurant page (read-only)

5. Customer account:
   - `src/app/(public)/account/page.tsx` — profile (name, phone, email), logout

**Test requirements:**
- Order history shows past orders (auth required)
- Reorder populates cart correctly
- Save/unsave toggles persist
- Reviews submit and display on restaurant page

**Integration notes:**
- Requires `order.myOrders`, `review.create`, `review.listByRestaurant`, `savedRestaurant.toggle` procedures
- Reorder needs to check item availability before adding to cart

**Demo:** View past orders, tap "Reorder" to re-add items to cart, save a restaurant, write a review.

---

## Step 16: Polish

**Objective:** Add loading states, error boundaries, responsive fine-tuning, and cross-cutting concerns.

**Implementation guidance:**

1. Loading states:
   - `loading.tsx` skeletons for all async pages
   - Skeleton variants matching each page's layout

2. Error boundaries:
   - `error.tsx` for each route group
   - Graceful error display with retry button

3. Responsive tweaks:
   - Customer pages: test at 390px (mobile) and 1024px+ (desktop)
   - Owner/Admin: test at 768px (tablet) and 1440px (desktop)
   - Sidebar collapses to icon mode on tablet, bottom sheet on mobile

4. SEO:
   - Metadata for public pages (restaurant, discovery)
   - `generateStaticParams` for restaurant pages (ISR)
   - OpenGraph images for restaurant sharing

5. Accessibility:
   - Keyboard navigation through menu items
   - Screen reader labels on all interactive elements
   - Focus management on sheet open/close

6. Push notifications setup:
   - Web push registration for order status updates
   - Notification permission request at appropriate moment

**Test requirements:**
- All pages have loading states
- Error boundaries catch and display errors
- Pages render correctly at all target breakpoints
- Lighthouse accessibility score ≥ 90

**Integration notes:**
- This step touches all existing pages
- Run full Playwright E2E suite after changes

**Demo:** Full customer flow (discover → browse → customize → cart → checkout → pay → track) and full owner flow (onboard → menu → orders) with no dead ends, proper loading states, and error handling.
