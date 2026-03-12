# Research: Menu & Cart System

## Cart Store (`src/features/cart/stores/cart.store.ts`)

**State:** `items: CartItem[]`, `branchSlug: string | null`

**CartItem shape:** `uuid`, `menuItemId`, `name`, `imageUrl`, `basePrice`, `variantId`, `variantName`, `variantPrice`, `modifiers: SelectedModifier[]`, `quantity`, `unitPrice`

**Smart merging:** `isEqual()` checks same `menuItemId` + same `variantId` + same modifier set (order-independent, sorted by ID). Duplicates merge quantities instead of creating separate entries.

**Persistence:** Zustand `persist` middleware, key `"cravings-cart"`, stores only `items` and `branchSlug`.

**Selectors (with `useShallow`):**
- `useCartItems()`, `useCartTotal()`, `useCartItemCount()`, `useCartBranch()`
- `useCartActions()` — uses `useShallow()` to return object of all 6 actions
- `computeUnitPrice(item)` — exported helper (base/variant + sum of modifier prices)

## Cart UI (`src/features/cart/components/`)

| Component | Role |
|-----------|------|
| `cart-drawer.tsx` | Container drawer, lists items, summary, checkout button |
| `cart-floating-button.tsx` | Fixed pill button at bottom (z-40), badge + total |
| `cart-item.tsx` | Item row with thumbnail, variant/modifier summary, quantity picker |
| `cart-summary.tsx` | Subtotal display |

## Menu Components (`src/features/menu/components/`)

**Orchestrator:** `restaurant-menu.tsx` (RestaurantMenu)
- Manages all interactive state: selected item, sheet mode, search, cart drawer, checkout, payment
- Computes `cartQuantities` map (menuItemId → total qty)
- Renders: CategoryTabs, MenuSectionList, MenuItemSheet, MenuSearchSheet, CartFloatingButton, CartDrawer, CheckoutSheet, OrderConfirmationSheet, PaymentSheet

**13 components total:**
- `restaurant-menu.tsx` — orchestrator
- `menu-item-sheet.tsx` — customization dialog (variants, modifiers, quantity)
- `menu-item-card.tsx` — item card (quick-add or inline quantity)
- `menu-section-list.tsx` — renders categories with intersection observer refs
- `category-tabs.tsx` — sticky horizontal scroll, search button
- `modifier-group.tsx` — RadioGroup (single) or Checkbox (multi), min/max rules
- `quantity-picker.tsx` / `inline-quantity-picker.tsx` / `quick-add-button.tsx`
- `restaurant-header.tsx` — cover, logo, name, address, contact
- `menu-search-sheet.tsx` — client-side fuzzy search with `useDeferredValue`
- `copy-contact-button.tsx`
- `use-category-observer.ts` — IntersectionObserver hook for active category

## Menu Backend (`src/modules/menu/`)

**Router procedures:**
- `publicProcedure`: `getPublicMenu(branchId)`
- `protectedProcedure`: `hasContent`, `getManagementMenu`, full CRUD for categories/items/variants/modifierGroups/modifiers

**Service:** Implements `IMenuService`. Constructor takes menuRepo, branchRepo, restaurantRepo, orgRepo, txManager. Ownership chain verification: category → branch → restaurant → organization.ownerId.

**Repository:** `findFullMenu(branchId, ctx?, options?)` — fetches categories → items → parallel (variants, modifierGroups, modifiers), builds nested `FullMenu` structure.

**Types:** `FullMenu = MenuCategoryWithItems[]` → `{category, items: MenuItemWithDetails[]}` → `{item, variants[], modifierGroups: ModifierGroupWithModifiers[]}`

## Menu Page Route (`src/app/(public)/restaurant/[slug]/page.tsx`)

- **Server component** with `revalidate = 300` (5-min ISR)
- Fetches restaurant by slug → primary branch → menu via tRPC server caller
- Passes menu data as props to `RestaurantMenu` (client component)
- Also renders `RestaurantReviews` (will need feature flag gating)

## Item Customization Flow (end-to-end)

1. Click item → `onSelect(menuItem)` → opens `MenuItemSheet` in "add" mode
2. Auto-selects first variant; customer picks modifiers (RadioGroup or Checkbox per group rules)
3. Real-time price: base/variant + modifier prices × quantity
4. Submit → builds CartItem → `addItem()` → smart merge or push new entry → toast
5. Edit from cart → finds cart item + full MenuItemWithDetails → reopens sheet in "edit" mode → `updateItem()`
6. Quick add (no variants/modifiers) → builds simple CartItem → `addItem()` directly

## Key Implications for Capability Model

**Where browse-mode gating plugs in:**

1. **RestaurantMenu orchestrator** — needs `menuContext` prop to conditionally:
   - Show/hide CartFloatingButton
   - Disable add-to-cart in MenuItemSheet
   - Show "Scan QR to order" CTA instead of cart/checkout
   - Disable quick-add buttons on MenuItemCard

2. **Menu page route** — currently always renders in what will become "browse mode". The new `/t/{publicId}` route needs to pass `menu_context` with dine-in capability.

3. **Cart store** — no changes needed (it's just local state). The gating happens at the UI layer.

4. **Backend** — `menu.getPublicMenu` doesn't need to change. The capability model is a separate concern from menu data fetching.
