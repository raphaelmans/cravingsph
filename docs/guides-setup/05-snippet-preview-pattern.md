# 05 — Snippet Preview Pattern

Interactive guides show inert previews of CravingsPH UI so users see
exactly what they will encounter. This document explains the "What You Will
See" pattern.

## Core idea

Each step in an interactive guide can optionally render a **snippet** — a
visual preview of the actual UI component the user will interact with. These
snippets:

1. Use **real CravingsPH components** (shadcn/ui, custom components)
2. Are wrapped in an inert container (no clicks, no hover effects)
3. Are populated with **mock data** (not live tRPC queries)
4. Are mapped to sections by ID, decoupling content from rendering

## GuideSnippetWrapper

A thin wrapper that makes any child component inert:

```tsx
// src/features/guides/components/guide-snippet-wrapper.tsx

export function GuideSnippetWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none select-none rounded-xl border border-dashed border-border/60 bg-muted/30 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        What you will see
      </p>
      {children}
    </div>
  );
}
```

**Key CSS:** `pointer-events-none` prevents all interaction. `select-none`
prevents text selection. The dashed border and muted background signal
"preview, not live UI".

## Snippet map pattern

Each journey defines a map from section IDs to React components:

```tsx
// src/features/guides/components/ordering-guide/ordering-guide-snippets.tsx

const ORDERING_GUIDE_SNIPPET_MAP: Record<string, ReactNode> = {
  "browse-and-add": <MockMenuBrowsing />,
  "browse-and-add/select-variant": <MockVariantSelector />,
  "review-cart": <MockCartDrawer />,
  "checkout": <MockCheckoutSheet />,
  "track-order": <MockOrderTracker />,
};

export function getOrderingSnippetForSection(
  sectionId: string,
): ReactNode | null {
  return ORDERING_GUIDE_SNIPPET_MAP[sectionId] ?? null;
}
```

The resolver function is passed to `InteractiveGuideArticlePage` as
`getSnippetForSection`. The shell calls it for any section/subsection
where `hasSnippet: true`.

## Writing mock components

### Guidelines

1. **Import real components** — use the actual `RestaurantCard`, `CartItem`,
   `CheckoutSheet`, etc. from the features directory. This ensures previews
   match production exactly.

2. **Mock only data** — create static objects that satisfy the component's
   props. Do not mock hooks or context providers unless absolutely necessary.

3. **Hardcode realistic values** — use Filipino restaurant names, real dish
   names, PHP prices. This makes guides feel authentic.

4. **Keep it minimal** — show the essential UI elements. A cart preview
   doesn't need 10 items — 2-3 items demonstrates the pattern.

5. **No tRPC calls** — snippets are purely visual. Never import or call
   tRPC hooks inside snippet components.

### Example: MockCartDrawer

```tsx
function MockCartDrawer() {
  return (
    <div className="w-full max-w-sm rounded-2xl border bg-background p-4">
      <h3 className="mb-3 text-sm font-semibold">Your Order</h3>
      <div className="space-y-3">
        <MockCartItem
          name="Chicken Adobo"
          price="₱180.00"
          quantity={2}
        />
        <MockCartItem
          name="Sinigang na Baboy"
          price="₱220.00"
          quantity={1}
        />
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium">Total</span>
        <span className="font-semibold">₱580.00</span>
      </div>
    </div>
  );
}
```

### When to simplify vs reuse

| Scenario | Approach |
|----------|----------|
| Component is self-contained with simple props | Import and pass mock props |
| Component requires context providers | Build a simplified mock version |
| Component has heavy side effects (WebSocket, etc.) | Build a simplified mock version |
| Component uses Zustand store | Build a simplified mock version |

**Cart components** require the Zustand store, so mock versions are needed.
**Restaurant cards** accept props directly and can be imported as-is.

## Snippet map per journey

### Journey 1 — Discovery & Search

| Section ID | Snippet | Source components |
|-----------|---------|-------------------|
| `search-restaurants` | `MockRestaurantSearch` | `Input`, `RestaurantCard` |
| `search-dishes` | `MockFoodSearch` | `Input`, `FoodSearchResults` |
| `apply-filters` | `MockFilterBar` | `CuisineFilter`, `LocationFilter`, `BarangayFilter` |
| `browse-menu` | `MockMenuView` | `RestaurantHeader`, `CategoryTabs`, `MenuItemCard` |
| `scan-qr-code` | `MockQRScanner` | `QrScannerModal` mock |

### Journey 2 — Owner Setup

| Section ID | Snippet | Source components |
|-----------|---------|-------------------|
| `accept-invitation` | `MockInvitationPage` | Custom mock |
| `create-organization` | `MockOrgForm` | `OrganizationForm` fields |
| `register-restaurant` | `MockRestaurantForm` | `RestaurantForm` fields |
| `add-branch` | `MockBranchForm` | `BranchForm` fields (with street, barangay, amenities) |
| `build-menu` | `MockMenuBuilder` | `AddCategoryDialog`, `AddItemDialog` mocks |
| `set-operating-hours` | `MockHoursEditor` | `WeeklyHoursEditor` |
| `go-live` | `MockCompletionStep` | `CompletionStep` mock |

### Journey 3 — Dine-in Ordering

| Section ID | Snippet | Source components |
|-----------|---------|-------------------|
| `browse-and-add` | `MockMenuBrowsing` | `MenuItemCard`, `QuickAddButton` |
| `browse-and-add/select-variant` | `MockVariantSelector` | `MenuItemSheet` mock |
| `review-cart` | `MockCartDrawer` | Cart item layout |
| `checkout` | `MockCheckoutSheet` | Checkout form fields |
| `track-order` | `MockOrderTracker` | `OrderStatusTracker` |

### Journey 4 — Owner Operations

| Section ID | Snippet | Source components |
|-----------|---------|-------------------|
| `view-order-queue` | `MockOrderQueue` | `OrderDashboardTabs`, `OrderRow` |
| `accept-reject` | `MockAcceptReject` | `AcceptRejectActions` |
| `update-status` | `MockStatusUpdate` | `StatusUpdateDropdown` |
| `manage-menu` | `MockMenuEditor` | Menu management layout |
| `branch-settings` | `MockBranchSettings` | Settings form |

### Journey 5 — Governance

| Section ID | Snippet | Source components |
|-----------|---------|-------------------|
| `dashboard-overview` | `MockAdminDashboard` | `AdminDashboardStatCard` |
| `manage-invitations` | `MockInvitationsPage` | Invitations table mock |
| `manage-restaurants` | `MockRestaurantManagement` | `AdminRestaurantListCard` |
| `manage-users` | `MockUserManagement` | `AdminUserTable` mock |
