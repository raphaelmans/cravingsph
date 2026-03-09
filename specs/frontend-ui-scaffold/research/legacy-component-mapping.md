# Legacy Component Mapping

## Components to Migrate (Carry Forward)

| Legacy Component | shadcn Primitives | New Strategy |
|---|---|---|
| QuantityPicker | Custom (Lucide icons) | Keep, add Button primitives, aria labels |
| MenuItemQuantityPicker | QuantityPicker + store | Decouple from store, props-based |
| BackButton | Button | Button variant with preset styling |
| CoverPicture | None (Next Image) | Add height prop, blur placeholder |
| MenuItemSheet | Sheet, Button, Separator | Merge with BillItemSheet via `mode` prop |
| BillItemSheet | Sheet, Button, Separator | Merge into MenuItemSheet |
| BillSheet | Sheet | Props-based instead of hook-based |
| MenuList | None | Keep, add lazy loading |
| RestaurantMenuItem | Separator | Keep, add skeleton loading |
| MenuCategoriesSelect | Select | **Replace with horizontal scroll tabs** |
| MenuItemModifier | Checkbox, RadioGroup, Label | Extract OptionRow, add validation |
| MenuSearchSheet | Sheet | Add fuzzy search, debounce |
| CartFloatingButton | Button | Keep pattern, update styling |

## Components to Create (New)

| Component | Purpose | shadcn Primitives |
|---|---|---|
| CategoryTabs | Horizontal scroll pill tabs | ScrollArea, custom tabs |
| CheckoutSheet | Adaptive checkout form | Sheet, Form, Input, RadioGroup |
| PaymentMethodDisplay | Show payment details + copy | Card, Button (copy) |
| PaymentProofUpload | Upload reference + screenshot | Sheet, Input, Button |
| OrderStatusTracker | Real-time order progress | Progress, Badge |
| OrderCard | Order in history list | Card, Badge |
| RestaurantCard | Discovery restaurant card | Card, Badge |
| DiscoverySearch | Home page search | Input, Command |
| CuisineFilter | Cuisine category pills | Badge/Toggle |
| OwnerSidebar | Restaurant→Branch nav | Sidebar, Collapsible, SidebarMenuSub |
| AdminSidebar | Admin nav with badges | Sidebar, Badge |
| OnboardingWizard | 7-step setup flow | Card, Progress, Form |
| OnboardingHub | Card grid hub | Card |
| MenuManagementGrid | Admin menu CRUD | Table, Card, Dialog |
| OrderDashboard | Tabbed order management | Tabs, Table, Badge |
| PaymentConfigForm | Payment method setup | Form, Input, Select |
| TeamManagement | Invite + roles | Table, Dialog, Select |
| BranchSettings | Hours, QR, toggles | Form, Switch, Card |

## State Management Changes

| Legacy | New |
|---|---|
| `bill.store.ts` (monolithic) | Split: `cart.store.ts` (items) + restaurant context via tRPC |
| `useBillItemSheet` / `useMenuItemSheet` (duplicate) | Generic `useSheetState<T>` hook |
| `useQuantityPicker` (2s timeout) | Generic `useAutoHide(timeout)` hook |
| Direct localStorage via Zustand persist | Keep, add branch scoping |

## Key Improvements Over Legacy

1. **Required modifier validation** before add-to-cart (legacy had none)
2. **Horizontal scroll tabs** instead of dropdown for categories
3. **Fuzzy search** instead of substring matching
4. **Merged item sheet** (add/edit modes) instead of duplicate components
5. **Props-driven components** instead of hook-coupled
6. **Price component** (`<Price />`) for consistent orange formatting
