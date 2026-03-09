# Frontend UI Scaffold — Detailed Design

## 1. Overview

Complete frontend scaffold for CravingsPH: all pages, components, and route wirings across three portals (Customer, Owner, Admin) covering all 7 PRD delivery phases. Built on shadcn/ui (New York style) with the established design system (`#f86006` orange brand, pill shapes for customer, standard rounded for admin, Inter/League Spartan typography).

This document is standalone — it describes every route, component, layout, and state concern needed to scaffold the full frontend.

---

## 2. Detailed Requirements

### Portal Separation
- **Strict isolation**: Customer and Owner are separate identities with no portal switching
- Customer accounts are optional (guest checkout supported)
- Owner accounts are created via dedicated owner registration
- Admin access is role-gated (`requireAdminSession()`)
- Owner "preview" = opens public restaurant URL in new tab

### Route Groups (Next.js App Router)
Following the reference repo (next16bp) pattern:
- `(public)` — Customer-facing, no auth required
- `(auth)` — Login/register pages, smart route-type detection
- `(owner)` — Restaurant owner portal, server-side org gate
- `(admin)` — Admin portal, role guard

### Design System
- Customer-facing: `shape="pill"` on buttons/inputs, bottom sheets, mobile-first
- Owner/Admin: `rounded-md` default, desktop-first sidebar layout
- Brand: `--primary: #f86006`, `<Price />` for all amounts, `<Logo />` for wordmark
- Peach backgrounds for hero sections and empty states

### Navigation
- Customer: horizontal-scroll pill tabs for categories (Figma intent), floating cart button
- Owner: collapsible sidebar (Org header → flat nav + Restaurant → Branch hierarchy)
- Admin: flat sidebar with badge counts

### UI Surfaces
- Bottom sheets (Drawer) for all mobile interactions: item customization, cart, checkout, payment
- Full pages for: discovery, restaurant browsing, order tracking
- Dialogs for: owner CRUD operations (add item, add category, confirm actions)

---

## 3. Architecture Overview

### Route Map

```
src/app/
├── layout.tsx                          # Root: fonts, metadata, providers
├── page.tsx                            # Redirect → /(public) home
│
├── (public)/                           # CUSTOMER PORTAL
│   ├── layout.tsx                      # CustomerShell (mobile header + optional bottom nav)
│   ├── page.tsx                        # Discovery / home page
│   ├── search/
│   │   └── page.tsx                    # Restaurant search results
│   ├── restaurant/
│   │   └── [slug]/
│   │       ├── page.tsx                # Menu browsing (SSR)
│   │       ├── loading.tsx             # Skeleton
│   │       └── order/
│   │           └── [orderId]/
│   │               └── page.tsx        # Order tracking (real-time)
│   ├── orders/
│   │   └── page.tsx                    # Order history (conditional auth)
│   ├── saved/
│   │   └── page.tsx                    # Saved restaurants (conditional auth)
│   └── account/
│       └── page.tsx                    # Customer profile (conditional auth)
│
├── (auth)/
│   ├── layout.tsx                      # Centered card layout
│   ├── login/
│   │   └── page.tsx                    # Customer login
│   ├── register/
│   │   ├── page.tsx                    # Customer registration
│   │   └── owner/
│   │       └── page.tsx                # Owner registration (separate flow)
│   ├── magic-link/
│   │   └── page.tsx                    # Passwordless sign-in
│   └── post-login/
│       └── route.ts                    # Redirect handler (→ / or /organization)
│
├── (owner)/                            # OWNER PORTAL
│   ├── layout.tsx                      # DashboardShell + org gate
│   ├── organization/
│   │   ├── page.tsx                    # Owner dashboard (overview)
│   │   ├── get-started/
│   │   │   └── page.tsx               # Onboarding hub (card grid)
│   │   ├── onboarding/
│   │   │   └── page.tsx               # Onboarding wizard (7-step)
│   │   ├── restaurants/
│   │   │   ├── page.tsx               # Restaurant list
│   │   │   └── [restaurantId]/
│   │   │       ├── page.tsx            # Restaurant detail/edit
│   │   │       └── branches/
│   │   │           ├── page.tsx        # Branch list
│   │   │           └── [branchId]/
│   │   │               ├── page.tsx    # Branch detail/edit
│   │   │               ├── menu/
│   │   │               │   └── page.tsx  # Menu management
│   │   │               ├── orders/
│   │   │               │   ├── page.tsx  # Order dashboard (tabs)
│   │   │               │   └── [orderId]/
│   │   │               │       └── page.tsx  # Order detail
│   │   │               ├── payments/
│   │   │               │   └── page.tsx  # Payment verification queue
│   │   │               ├── settings/
│   │   │               │   └── page.tsx  # Branch settings
│   │   │               └── qr/
│   │   │                   └── page.tsx  # QR code generation
│   │   ├── payments/
│   │   │   └── page.tsx               # Payment method config (org-level)
│   │   ├── team/
│   │   │   └── page.tsx               # Team management
│   │   ├── verify/
│   │   │   └── page.tsx               # Verification documents
│   │   └── settings/
│   │       └── page.tsx               # Organization settings
│   └── account/
│       └── profile/
│           └── page.tsx               # Owner profile
│
├── (admin)/                            # ADMIN PORTAL
│   ├── layout.tsx                      # DashboardShell + admin guard
│   └── admin/
│       ├── page.tsx                    # Admin dashboard (stats)
│       ├── verification/
│       │   ├── page.tsx               # Verification queue
│       │   └── [requestId]/
│       │       └── page.tsx           # Verification review
│       ├── restaurants/
│       │   ├── page.tsx               # All restaurants
│       │   └── [id]/
│       │       └── page.tsx           # Restaurant detail (admin)
│       └── users/
│           └── page.tsx               # User management
│
├── auth/
│   └── callback/
│       └── route.ts                   # Supabase OAuth callback
│
└── api/
    └── trpc/[trpc]/
        └── route.ts                   # tRPC handler (existing)
```

### Layout Hierarchy

```
RootLayout (fonts, ThemeProvider, TRPCProvider, QueryClientProvider, Toaster)
│
├── (public)/layout.tsx → CustomerShell
│   ├── CustomerHeader (Logo left, cart icon right, optional auth)
│   └── main (children)
│
├── (auth)/layout.tsx → AuthShell
│   └── Centered card container
│
├── (owner)/layout.tsx → requireSession() + org gate
│   └── DashboardShell
│       ├── OwnerSidebar
│       │   ├── SidebarHeader (org name + role badge)
│       │   ├── SidebarContent (nav groups)
│       │   └── SidebarFooter (user info)
│       └── SidebarInset
│           ├── OwnerNavbar (breadcrumbs + actions)
│           └── main (children)
│
├── (admin)/layout.tsx → requireAdminSession()
│   └── DashboardShell
│       ├── AdminSidebar
│       │   ├── SidebarHeader ("Admin" label)
│       │   ├── SidebarContent (flat nav + badges)
│       │   └── SidebarFooter (user info)
│       └── SidebarInset
│           ├── AdminNavbar (breadcrumbs)
│           └── main (children)
```

---

## 4. Components and Interfaces

### 4.1 Shared / Brand Components (existing + new)

| Component | File | Status | Purpose |
|---|---|---|---|
| `Logo` | `components/brand/logo.tsx` | Exists | Wordmark "cravıngs" |
| `Price` | `components/brand/price.tsx` | Exists | Orange formatted price |
| `BackButton` | `components/brand/back-button.tsx` | New | Circular back arrow (from legacy) |
| `CoverImage` | `components/brand/cover-image.tsx` | New | Responsive Next.js Image wrapper |
| `EmptyState` | `components/brand/empty-state.tsx` | New | Peach bg + illustration + CTA |
| `RequiredBadge` | `components/brand/required-badge.tsx` | New | Orange pill "Required" |
| `OptionalBadge` | `components/brand/optional-badge.tsx` | New | Orange outline "Optional" |

### 4.2 Customer — Menu Browsing (Phase 1)

**Page: `/restaurant/[slug]`**

```
RestaurantPage (Server Component)
├── RestaurantHeader
│   ├── CoverImage (full-bleed hero)
│   ├── RestaurantProfilePicture (circular, overlaps cover)
│   ├── RestaurantInfo (name, address, phone)
│   └── CopyContactButton
├── RestaurantMenu (Client Component — main orchestrator)
│   ├── MenuSearchSheet
│   │   ├── Input shape="pill"
│   │   └── RestaurantMenuItem[] (filtered results)
│   ├── CategoryTabs (NEW — horizontal scroll pills)
│   │   └── ScrollArea horizontal
│   │       └── Button shape="pill" variant per active state
│   ├── MenuSectionList
│   │   └── MenuSection[] (per category)
│   │       ├── Category heading (with id for scroll target)
│   │       └── MenuItemCard[]
│   │           ├── CoverImage (thumbnail)
│   │           ├── Item name, description, price
│   │           └── QuickAddButton / InlineQuantityPicker
│   ├── MenuItemSheet (Drawer side="bottom")
│   │   ├── CoverImage
│   │   ├── Item name, description, price
│   │   ├── ModifierGroupList
│   │   │   └── ModifierGroup[]
│   │   │       ├── Group header + RequiredBadge/OptionalBadge
│   │   │       ├── RadioGroup (single-select) OR
│   │   │       └── CheckboxGroup (multi-select)
│   │   │           └── ModifierOption (name + price)
│   │   └── SheetFooter
│   │       ├── QuantityPicker
│   │       └── Button "₱{total} · Add to cart"
│   └── CartFloatingButton (fixed bottom)
│       └── Drawer trigger → CartDrawer
│           ├── CartItemList
│           │   └── CartItem[] (image, name, modifiers, qty, price)
│           │       └── InlineQuantityPicker
│           ├── CartSummary (subtotal)
│           └── Button "Checkout"
```

**New components for Phase 1:**

| Component | File | shadcn Deps | Props |
|---|---|---|---|
| `CategoryTabs` | `features/menu/components/category-tabs.tsx` | ScrollArea, Button | `categories`, `activeId`, `onSelect` |
| `MenuSectionList` | `features/menu/components/menu-section-list.tsx` | — | `categories`, `onItemSelect` |
| `MenuItemCard` | `features/menu/components/menu-item-card.tsx` | Separator | `item`, `cartQuantity`, `onSelect`, `onQuickAdd` |
| `QuickAddButton` | `features/menu/components/quick-add-button.tsx` | Button | `onClick` |
| `InlineQuantityPicker` | `features/menu/components/inline-quantity-picker.tsx` | Button | `quantity`, `onChange`, `onRemove` |
| `QuantityPicker` | `features/menu/components/quantity-picker.tsx` | Button | `value`, `onChange`, `min`, `max` |
| `MenuItemSheet` | `features/menu/components/menu-item-sheet.tsx` | Drawer, Button, Separator | `item`, `mode: 'add' | 'edit'`, `initialSelections?`, `onSubmit` |
| `ModifierGroup` | `features/menu/components/modifier-group.tsx` | RadioGroup, Checkbox, Label | `group`, `selected`, `onChange` |
| `ModifierOption` | `features/menu/components/modifier-option.tsx` | Label | `option`, `selected`, `type`, `onChange` |
| `CartDrawer` | `features/cart/components/cart-drawer.tsx` | Drawer, Button | `items`, `onEdit`, `onCheckout` |
| `CartItem` | `features/cart/components/cart-item.tsx` | — | `item`, `onQuantityChange`, `onEdit`, `onRemove` |
| `CartSummary` | `features/cart/components/cart-summary.tsx` | Separator | `subtotal`, `itemCount` |
| `CartFloatingButton` | `features/cart/components/cart-floating-button.tsx` | Button | `itemCount`, `total` |
| `MenuSearchSheet` | `features/menu/components/menu-search-sheet.tsx` | Drawer, Input | `categories`, `onItemSelect` |
| `RestaurantHeader` | `features/menu/components/restaurant-header.tsx` | — | `restaurant` (name, cover, profile, address, phone) |
| `CopyContactButton` | `features/menu/components/copy-contact-button.tsx` | Button, Tooltip | `value`, `label` |

### 4.3 Customer — Ordering & Checkout (Phase 3)

**Checkout flow lives inside the restaurant page as a bottom sheet.**

```
CheckoutSheet (Drawer side="bottom")
├── SheetHeader "Checkout"
├── OrderTypeSelector
│   ├── RadioGroup
│   │   ├── "Dine-in" option
│   │   └── "Pickup" option
├── CheckoutForm (adapts based on order type)
│   ├── [dine-in] TableNumberInput (optional, if restaurant requires it)
│   ├── [pickup] NameInput
│   ├── [pickup] PhoneInput
│   └── SpecialInstructionsTextarea
├── CartSummary (readonly)
└── SheetFooter
    └── Button "Place Order ₱{total}"
```

**Post-checkout:**

```
OrderConfirmationSheet (Drawer side="bottom")
├── Success icon + "Order Placed!"
├── Order ID display
├── Next steps copy (payment instructions)
└── Button "View Order Status" → navigates to /restaurant/[slug]/order/[orderId]
```

| Component | File | shadcn Deps |
|---|---|---|
| `CheckoutSheet` | `features/checkout/components/checkout-sheet.tsx` | Drawer, Form, Input, RadioGroup, Textarea, Button |
| `OrderTypeSelector` | `features/checkout/components/order-type-selector.tsx` | RadioGroup, Label |
| `OrderConfirmationSheet` | `features/checkout/components/order-confirmation-sheet.tsx` | Drawer, Button |

### 4.4 Customer — Payments (Phase 5)

**Payment flow is shown after order placement, also as a bottom sheet.**

```
PaymentSheet (Drawer side="bottom")
├── SheetHeader "Complete Payment"
├── PaymentCountdown (countdown timer)
├── PaymentMethodList
│   └── PaymentMethodCard[] (GCash, Maya, Bank)
│       ├── Method name + icon
│       ├── Account details
│       └── CopyButton (account number)
├── Separator
├── PaymentProofForm
│   ├── Input "Reference Number"
│   ├── FileUpload "Upload Screenshot" (optional)
│   └── Button "Submit Payment Proof"
└── OR
    └── Button "Pay with Cash at Counter" (dine-in only)
```

| Component | File | shadcn Deps |
|---|---|---|
| `PaymentSheet` | `features/payment/components/payment-sheet.tsx` | Drawer, Card, Button, Input, Separator |
| `PaymentCountdown` | `features/payment/components/payment-countdown.tsx` | Progress |
| `PaymentMethodCard` | `features/payment/components/payment-method-card.tsx` | Card, Button |
| `PaymentProofForm` | `features/payment/components/payment-proof-form.tsx` | Form, Input, Button |

### 4.5 Customer — Order Tracking (Phase 3)

**Page: `/restaurant/[slug]/order/[orderId]`**

```
OrderTrackingPage
├── RestaurantHeader (compact — name + logo only)
├── OrderStatusTracker
│   ├── StatusStep[] (vertical timeline)
│   │   ├── PLACED ✓
│   │   ├── ACCEPTED ✓ (or skipped for auto-accept)
│   │   ├── PREPARING ← current
│   │   ├── READY
│   │   └── COMPLETED
│   └── Real-time update via Supabase Realtime
├── OrderDetails
│   ├── Order type + table number
│   ├── OrderItemList (readonly)
│   └── Price total
└── PaymentStatus
    ├── Badge (paid / pending / rejected)
    └── Button "Upload Payment Proof" (if pending)
```

| Component | File | shadcn Deps |
|---|---|---|
| `OrderStatusTracker` | `features/order-tracking/components/order-status-tracker.tsx` | Badge |
| `StatusStep` | `features/order-tracking/components/status-step.tsx` | — |
| `OrderDetails` | `features/order-tracking/components/order-details.tsx` | Card, Separator |

### 4.6 Customer — Discovery (Phase 6)

**Page: `/` (home)**

```
DiscoveryPage
├── HeroSection (bg-peach)
│   ├── Logo size="lg"
│   ├── "Craving for something?" heading
│   └── SearchBar shape="pill" (→ /search)
├── CuisineCategories
│   └── ScrollArea horizontal
│       └── CuisinePill[] (icon + label)
├── FeaturedRestaurants
│   ├── Section heading
│   └── RestaurantCardList (horizontal scroll)
│       └── RestaurantCard[]
│           ├── CoverImage
│           ├── Restaurant name, cuisine tags
│           └── Preview items (horizontal scroll)
├── NearbyRestaurants
│   └── RestaurantCardList (vertical)
└── ScanQRCTA (fixed bottom)
    └── Button shape="pill" "Scan cravings QR"
```

**Page: `/search`**

```
SearchPage
├── SearchBar (auto-focused)
├── FilterBar
│   ├── CuisineFilter (pills)
│   └── LocationFilter (province → city Select)
└── RestaurantCardList (paginated)
```

| Component | File | shadcn Deps |
|---|---|---|
| `HeroSection` | `features/discovery/components/hero-section.tsx` | Input |
| `CuisinePill` | `features/discovery/components/cuisine-pill.tsx` | Button |
| `RestaurantCard` | `features/discovery/components/restaurant-card.tsx` | Card, Badge |
| `RestaurantCardList` | `features/discovery/components/restaurant-card-list.tsx` | ScrollArea |
| `ScanQRCTA` | `features/discovery/components/scan-qr-cta.tsx` | Button |
| `LocationFilter` | `features/discovery/components/location-filter.tsx` | Select |

### 4.7 Customer — Retention (Phase 7)

**Page: `/orders` (auth required)**

```
OrderHistoryPage
├── PageHeader "Your Orders"
└── OrderList
    └── OrderHistoryCard[]
        ├── Restaurant name + date
        ├── Item summary (truncated)
        ├── Total + status badge
        └── Button "Reorder"
```

**Page: `/saved` (auth required)**

```
SavedRestaurantsPage
├── PageHeader "Saved"
└── RestaurantCardList (vertical, with unsave action)
```

| Component | File | shadcn Deps |
|---|---|---|
| `OrderHistoryCard` | `features/orders/components/order-history-card.tsx` | Card, Badge, Button |
| `ReviewSheet` | `features/orders/components/review-sheet.tsx` | Drawer, Textarea, Button |
| `SaveButton` | `features/discovery/components/save-button.tsx` | Button (heart icon) |

### 4.8 Owner — Onboarding (Phase 2)

**Page: `/organization/get-started` (hub)**

```
OnboardingHubPage
├── PageHeader "Set Up Your Restaurant"
├── ProgressOverview (X of 7 steps complete)
└── SetupCardGrid (2-col)
    └── SetupCard[]
        ├── Icon + title
        ├── Description
        ├── Status badge (complete / in-progress / not started)
        └── Link → relevant page
```

**Page: `/organization/onboarding` (wizard)**

```
OnboardingWizardPage
├── WizardProgress (step indicator)
├── WizardStep (renders current step)
│   ├── Step 1: CreateOrganization (Form)
│   ├── Step 2: AddRestaurant (Form)
│   ├── Step 3: AddBranch (Form)
│   ├── Step 4: BuildMenu (guided menu creation)
│   ├── Step 5: PaymentMethods (payment config form)
│   ├── Step 6: Verification (document upload)
│   └── Step 7: Complete (success + next steps)
└── WizardFooter
    ├── Button "Back"
    └── Button "Next" / "Complete"
```

| Component | File | shadcn Deps |
|---|---|---|
| `SetupCard` | `features/onboarding/components/setup-card.tsx` | Card, Badge |
| `WizardProgress` | `features/onboarding/components/wizard-progress.tsx` | Progress |
| `WizardStep` | `features/onboarding/components/wizard-step.tsx` | Card |
| `OrganizationForm` | `features/onboarding/components/organization-form.tsx` | Form, Input, Textarea |
| `RestaurantForm` | `features/onboarding/components/restaurant-form.tsx` | Form, Input, Select |
| `BranchForm` | `features/onboarding/components/branch-form.tsx` | Form, Input, Select |
| `VerificationUpload` | `features/onboarding/components/verification-upload.tsx` | Form, Input, Button |

### 4.9 Owner — Menu Management (Phase 2)

**Page: `/organization/restaurants/[restaurantId]/branches/[branchId]/menu`**

```
MenuManagementPage
├── PageHeader "Menu" + Button "Add Category"
├── CategoryFilter (horizontal tabs)
├── SearchInput
├── SortSelect (name, price, date)
├── MenuItemGrid / MenuItemTable (toggle view)
│   └── MenuItemManagementCard[]
│       ├── Image thumbnail
│       ├── Name, description, price
│       ├── Availability toggle (Switch)
│       ├── DropdownMenu (Edit, Variants, Modifiers, Delete)
│       └── Drag handle (for reordering)
├── AddCategoryDialog
├── AddItemDialog
│   ├── Form: name, description, base price
│   ├── ImageUpload
│   └── Category select
├── EditItemDialog
├── VariantsDialog
│   └── VariantRow[] (name + price, add/remove)
└── ModifierGroupDialog
    ├── Form: group name, required toggle, min/max
    └── ModifierRow[] (name + price, add/remove)
```

| Component | File | shadcn Deps |
|---|---|---|
| `MenuItemManagementCard` | `features/menu-management/components/menu-item-card.tsx` | Card, Switch, DropdownMenu, Badge |
| `AddCategoryDialog` | `features/menu-management/components/add-category-dialog.tsx` | Dialog, Form, Input |
| `AddItemDialog` | `features/menu-management/components/add-item-dialog.tsx` | Dialog, Form, Input, Select, Textarea |
| `VariantsDialog` | `features/menu-management/components/variants-dialog.tsx` | Dialog, Form, Input, Button |
| `ModifierGroupDialog` | `features/menu-management/components/modifier-group-dialog.tsx` | Dialog, Form, Input, Switch, Button |
| `ImageUpload` | `features/menu-management/components/image-upload.tsx` | Input, Button |
| `MenuItemTable` | `features/menu-management/components/menu-item-table.tsx` | Table |

### 4.10 Owner — Order Management (Phase 4)

**Page: `/organization/restaurants/[restaurantId]/branches/[branchId]/orders`**

```
OrderDashboardPage
├── PageHeader "Orders"
├── Tabs
│   ├── Tab "Inbox" (badge: pending count)
│   ├── Tab "Active"
│   ├── Tab "Completed"
│   └── Tab "Cancelled"
└── TabContent
    └── OrderTable / OrderCardList
        └── OrderRow[]
            ├── Order ID, time
            ├── Customer name, order type
            ├── Item count, total
            ├── Status badge
            └── Actions: Accept/Reject (inbox), Update Status (active)

OrderDetailPage (/orders/[orderId])
├── OrderHeader (ID, time, status badge)
├── CustomerInfo (name, phone, table number)
├── OrderItemList (detailed: items, modifiers, quantities, prices)
├── SpecialInstructions
├── PaymentSection
│   ├── Payment status badge
│   ├── Payment proof (reference + screenshot)
│   └── Actions: Confirm Payment / Reject Payment / Mark Cash
├── OrderActions
│   ├── Accept / Reject (if inbox)
│   └── Update Status dropdown (preparing → ready → completed)
└── OrderTimeline (status history)
```

| Component | File | shadcn Deps |
|---|---|---|
| `OrderDashboardTabs` | `features/order-management/components/order-dashboard-tabs.tsx` | Tabs, Badge |
| `OrderRow` | `features/order-management/components/order-row.tsx` | Badge, Button, DropdownMenu |
| `OrderDetail` | `features/order-management/components/order-detail.tsx` | Card, Badge, Separator |
| `PaymentProofReview` | `features/order-management/components/payment-proof-review.tsx` | Card, Button, Dialog |
| `OrderTimeline` | `features/order-management/components/order-timeline.tsx` | — |
| `StatusUpdateDropdown` | `features/order-management/components/status-update-dropdown.tsx` | DropdownMenu, Button |
| `AcceptRejectActions` | `features/order-management/components/accept-reject-actions.tsx` | Button, AlertDialog |
| `DailySummaryCard` | `features/order-management/components/daily-summary-card.tsx` | Card |

### 4.11 Owner — Payments Config (Phase 5)

**Page: `/organization/payments`**

```
PaymentConfigPage
├── PageHeader "Payment Methods"
├── PaymentMethodList
│   └── PaymentMethodConfigCard[]
│       ├── Method type (GCash / Maya / Bank)
│       ├── Account details
│       ├── Default badge
│       └── Actions: Edit, Set Default, Remove
└── Button "Add Payment Method"
    └── AddPaymentMethodDialog
        ├── Select method type
        ├── Account name, number
        └── Bank name (if bank)
```

| Component | File | shadcn Deps |
|---|---|---|
| `PaymentMethodConfigCard` | `features/payment-config/components/payment-method-card.tsx` | Card, Badge, Button, DropdownMenu |
| `AddPaymentMethodDialog` | `features/payment-config/components/add-payment-method-dialog.tsx` | Dialog, Form, Input, Select |

### 4.12 Owner — Team & Settings (Phase 2)

**Page: `/organization/team`**

```
TeamPage
├── PageHeader "Team" + Button "Invite Member"
├── TeamTable
│   └── TeamMemberRow[]
│       ├── Name, email
│       ├── Role badge (Owner / Manager / Viewer)
│       └── Actions: Change Role, Revoke
└── InviteDialog
    ├── Input email
    └── Select role
```

**Page: `/organization/restaurants/[restaurantId]/branches/[branchId]/settings`**

```
BranchSettingsPage
├── PageHeader "Branch Settings"
├── Card "Operating Hours"
│   └── WeeklyHoursEditor (7 rows, open/close time pickers)
├── Card "Order Settings"
│   ├── Switch "Enable Online Ordering"
│   ├── Switch "Auto-Accept Orders"
│   └── Input "Payment Countdown (minutes)"
├── Card "QR Code"
│   ├── QR code preview
│   └── Button "Download QR" / "Print QR"
└── Card "Preview"
    └── Button "Preview as Customer" (opens public URL)
```

| Component | File | shadcn Deps |
|---|---|---|
| `TeamTable` | `features/team/components/team-table.tsx` | Table, Badge, DropdownMenu |
| `InviteDialog` | `features/team/components/invite-dialog.tsx` | Dialog, Form, Input, Select |
| `WeeklyHoursEditor` | `features/branch-settings/components/weekly-hours-editor.tsx` | Select, Switch |
| `QRCodePreview` | `features/branch-settings/components/qr-code-preview.tsx` | Card, Button |

### 4.13 Owner — Sidebar Navigation

```
OwnerSidebar
├── SidebarHeader
│   ├── Organization name
│   └── Role badge (Owner / Manager / Viewer)
├── SidebarContent
│   ├── SidebarGroup "Setup" (shown if onboarding incomplete)
│   │   └── SidebarNavItem "Get Started" (icon: Rocket)
│   │
│   ├── SidebarGroup "Overview"
│   │   └── SidebarNavItem "Dashboard" (icon: LayoutDashboard)
│   │
│   ├── SidebarGroup "Restaurants"
│   │   └── Collapsible per restaurant
│   │       ├── CollapsibleTrigger: Restaurant name (icon: Store)
│   │       └── CollapsibleContent: SidebarMenuSub
│   │           └── SidebarMenuSubItem per branch
│   │               └── Branch name → /organization/restaurants/[rId]/branches/[bId]/menu
│   │
│   ├── SidebarGroup "Orders" (filtered by permission)
│   │   └── SidebarNavItem "Orders" (icon: ClipboardList, badge: pending count)
│   │
│   ├── SidebarGroup "Finance" (owner-only)
│   │   └── SidebarNavItem "Payments" (icon: CreditCard)
│   │
│   ├── SidebarGroup "Organization" (owner-only)
│   │   ├── SidebarNavItem "Team" (icon: Users)
│   │   ├── SidebarNavItem "Verification" (icon: ShieldCheck)
│   │   └── SidebarNavItem "Settings" (icon: Settings)
│   │
│   └── SidebarGroup "Account"
│       └── SidebarNavItem "Profile" (icon: User)
│
└── SidebarFooter
    └── NavUser (name, email, logout)
```

### 4.14 Admin — Portal

**Page: `/admin`**

```
AdminDashboardPage
├── StatCards (grid)
│   ├── Total restaurants
│   ├── Pending verifications
│   ├── Total orders (today)
│   └── Total users
└── RecentActivity feed
```

**Admin Sidebar:**

```
AdminSidebar
├── SidebarHeader "Admin"
├── SidebarContent
│   ├── SidebarNavItem "Dashboard" (icon: LayoutDashboard)
│   ├── SidebarNavItem "Verification" (icon: ShieldCheck, badge: pending)
│   ├── SidebarNavItem "Restaurants" (icon: Store)
│   └── SidebarNavItem "Users" (icon: Users)
└── SidebarFooter: NavUser
```

---

## 5. State Management

### Client State (Zustand)

**Cart Store** (`features/cart/stores/cart.store.ts`):
```typescript
interface CartState {
  items: CartItem[]
  branchSlug: string | null
}

interface CartActions {
  addItem(item: CartItem): void        // Smart merge if identical
  removeItem(uuid: string): void
  updateItem(uuid: string, item: CartItem): void
  updateQuantity(uuid: string, quantity: number): void
  clearCart(): void
  setBranch(slug: string): void
}

// Derived
useCartItems(): CartItem[]
useCartTotal(): number
useCartItemCount(): number
useCartBranch(): string | null
```

- Persisted to localStorage via Zustand `persist` middleware
- Branch-scoped: switching restaurants prompts to clear cart
- Smart merging: identical items (same variant + same modifiers) combine

**CartItem type:**
```typescript
interface CartItem {
  uuid: string                    // Unique cart entry ID
  menuItemId: string              // Reference to menu item
  name: string
  imageUrl: string | null
  basePrice: number
  variantId: string | null
  variantName: string | null
  variantPrice: number | null
  modifiers: SelectedModifier[]   // { id, name, price }
  quantity: number
  unitPrice: number               // base + variant + modifiers
}
```

### Server State (TanStack Query via tRPC)

All server data flows through tRPC hooks — no Zustand for server state:

| Hook | tRPC Procedure | Used By |
|---|---|---|
| `usePublicMenu(slug)` | `menu.getPublicMenu` | Restaurant page |
| `useRestaurant(slug)` | `restaurant.getBySlug` | Restaurant page |
| `useMyOrders()` | `order.myOrders` | Order history |
| `useOrderStatus(id)` | `order.status` | Order tracking (+ realtime subscription) |
| `useMyOrganization()` | `organization.mine` | Owner layout |
| `useManagementMenu(branchId)` | `menu.getManagementMenu` | Menu management |
| `useBranchOrders(branchId, tab)` | `order.listByBranch` | Order dashboard |
| `useTeamMembers(orgId)` | `team.list` | Team page |

---

## 6. Error Handling

### Page-Level
- Each route group has an `error.tsx` boundary
- `loading.tsx` skeletons for async pages
- `notFound()` for invalid slugs/IDs

### Component-Level
- Form validation via Zod schemas + react-hook-form
- Toast notifications (Sonner) for action feedback
- Optimistic updates for cart operations
- AlertDialog for destructive actions (delete item, reject order, revoke access)

### Auth Errors
- Expired session → redirect to login with `?from=` return URL
- Unauthorized role → redirect to appropriate portal home
- Missing org → redirect to `/organization/get-started`

---

## 7. Acceptance Criteria

### Menu Browsing
- **Given** a customer scans a QR code, **When** the page loads, **Then** they see the restaurant header, category tabs, and menu items without login
- **Given** categories exist, **When** a customer taps a category tab, **Then** the page scrolls to that category section
- **Given** an item has no modifiers, **When** a customer taps "+", **Then** the item is added directly to cart with quantity 1
- **Given** an item has modifiers, **When** a customer taps the item, **Then** a bottom sheet opens with modifier selection

### Cart
- **Given** two identical items (same variant + modifiers), **When** the second is added, **Then** the first's quantity increases instead of creating a duplicate
- **Given** items in cart, **When** the page is refreshed, **Then** the cart persists from localStorage

### Checkout
- **Given** dine-in is selected, **When** the checkout form renders, **Then** only table number and special instructions are shown
- **Given** pickup is selected, **When** the checkout form renders, **Then** name and phone fields are also shown

### Payments
- **Given** an order is placed, **When** the payment sheet opens, **Then** the restaurant's configured payment methods are displayed with copy buttons
- **Given** payment proof is submitted, **When** the owner reviews it, **Then** they can confirm or reject the payment

### Owner Onboarding
- **Given** a new owner with no org, **When** they access `/organization`, **Then** they are redirected to `/organization/get-started`
- **Given** the wizard is started, **When** each step is completed, **Then** progress is saved and the next step loads

### Order Management
- **Given** a new order arrives, **When** the owner views the Inbox tab, **Then** the order appears with Accept/Reject actions
- **Given** an order is accepted, **When** the owner updates status, **Then** the customer's tracking page updates in real-time

### Admin
- **Given** a restaurant submits verification, **When** the admin views the queue, **Then** documents are shown with Approve/Reject actions

---

## 8. Testing Strategy

| Layer | Tool | What to Test |
|---|---|---|
| Cart store | Vitest | Smart merging, quantity updates, persistence, branch scoping |
| Price calculation | Vitest | Variant + modifier pricing, cart totals |
| Modifier validation | Vitest | Required groups enforced, min/max selection rules |
| Order status transitions | Vitest | Valid state machine transitions |
| Components | Vitest + RTL | MenuItemSheet renders modifiers, CartDrawer shows items, CheckoutSheet adapts by order type |
| Customer flow | Playwright | Browse → add to cart → checkout → payment → tracking |
| Owner flow | Playwright | Onboarding wizard completion, menu CRUD, order accept/reject |

---

## 9. Appendices

### A. shadcn/ui Components Used

**Already installed (53 components)** — all needed components are present. Key ones by feature:

| Feature | Components |
|---|---|
| Bottom sheets | Drawer (mobile), Sheet (desktop fallback) |
| Category tabs | ScrollArea, Button |
| Item customization | RadioGroup, Checkbox, Label, Separator |
| Forms | Form, Input, Select, Textarea, Switch |
| Cart | Drawer, Button, Separator |
| Tables (admin) | Table |
| Modals (admin) | Dialog, AlertDialog |
| Navigation | Sidebar, Collapsible |
| Feedback | Sonner (toast), Badge, Progress |
| Layout | Card, Tabs, Accordion, ScrollArea |

### B. Feature Module Structure

Each feature follows:
```
src/features/{feature}/
├── components/          # React components
├── hooks/               # Custom hooks (useXxx)
├── stores/              # Zustand stores (if needed)
└── types.ts             # Feature-specific types
```

### C. Key Differences from Legacy

| Aspect | Legacy | New |
|---|---|---|
| Category nav | Dropdown select | Horizontal scroll pill tabs |
| Item sheet | MenuItemSheet + BillItemSheet (duplicate) | Single MenuItemSheet with `mode` prop |
| Modal hooks | useMenuItemSheet + useBillItemSheet (duplicate) | Generic `useSheetState<T>` |
| Store naming | `bill.store` | `cart.store` |
| Store scoping | Global (no branch check) | Branch-scoped (prompt on switch) |
| Checkout | Dead end (no checkout) | Full checkout sheet with adaptive form |
| Payments | None | Payment method display + proof upload |
| Order tracking | None | Real-time status page |
| Discovery | "Coming Soon" | Full home page with search + filters |
| Owner portal | None | Complete dashboard with sidebar |
| Admin portal | None | Verification queue + restaurant management |
| Modifier validation | None (could skip required) | Validated before add-to-cart |

### D. Route Type Classification

```typescript
type RouteType = "public" | "guest" | "protected" | "organization" | "admin"

// public: /, /search, /restaurant/[slug], /restaurant/[slug]/order/[orderId]
// guest: /login, /register, /register/owner, /magic-link
// protected: /orders, /saved, /account (customer auth required)
// organization: /organization/** (owner auth + org required)
// admin: /admin/** (admin role required)
```
