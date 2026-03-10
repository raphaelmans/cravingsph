# Implementation Plan — Design System Hard Cutover

## Checklist

### Phase 1: Foundation
- [ ] Step 1: Design tokens alignment
- [ ] Step 2: Font system overhaul
- [ ] Step 3: Button component polish
- [ ] Step 4: Card hover elevation + restaurant card image ratio
- [ ] Step 5: Badge/chip normalization + input padding
- [ ] Step 6: Accent hover migration across UI components
- [ ] Step 7: Motion system + sheet/dialog timing
- [ ] Step 8: Hardcoded value cleanup + touch targets
- [ ] Step 9: Phase 1 visual QA gate

### Phase 2: Spacing Normalization
- [ ] Step 10: Card padding normalization
- [ ] Step 11: Gap and spacing grid enforcement (features)
- [ ] Step 12: Gap and spacing grid enforcement (app routes + components)
- [ ] Step 13: Arbitrary value removal + page margin consistency
- [ ] Step 14: Phase 2 visual QA gate

### Phase 3: Admin Overhaul
- [ ] Step 15: Dedicated PDD session for Phase 3 detailed design
- [ ] Step 16: Database schema + reorder mutations
- [ ] Step 17: dnd-kit integration + category/item reordering
- [ ] Step 18: Modifier section refactor (dialog → on-page collapsible)
- [ ] Step 19: Live preview panel + inline editing
- [ ] Step 20: Phase 3 visual QA gate

---

## Phase 1: Foundation

### Step 1: Design Tokens Alignment

**Objective:** Update all CSS custom property values in globals.css to match the Design System spec exactly.

**Implementation guidance:**
- Open `src/app/globals.css` and update every `:root` token value per the design document's token table
- Convert `--primary` from `#f86006` to `oklch(0.66 0.23 40)`
- Set `--accent` and `--accent-foreground` to match `--primary` / `--primary-foreground`
- Set `--ring` to `oklch(0.66 0.23 40)`
- Update `--foreground`, `--card-foreground`, `--popover-foreground` to `oklch(0.18 0.02 260)`
- Update `--secondary`, `--muted`, `--border`, `--input` with correct chroma (0.01) and hue (260)
- Update `--muted-foreground` to `oklch(0.45 0.02 260)`
- Keep `--destructive`, `--success`, `--warning`, `--peach`, `--sidebar-*`, `--chart-*` unchanged
- Keep `.dark` variant tokens unchanged (dark mode is not in scope)

**Test requirements:**
- Run `pnpm build` to verify no CSS compilation errors
- Snapshot test: capture computed token values and compare to spec table
- Visual spot check: load home page — primary orange should look identical (#F86006 and oklch(0.66 0.23 40) should resolve to the same perceptual color)

**Integration:** This is the foundation layer. All subsequent steps depend on correct tokens.

**Demo:** Home page loads with correct brand orange. All semantic colors (destructive, success, warning) unchanged. No visual regressions on existing pages beyond expected accent/ring color shifts (addressed in Step 6).

---

### Step 2: Font System Overhaul

**Objective:** Replace League Spartan with Plus Jakarta Sans for all headings, define the `font-heading` utility class, and establish the semantic heading scale.

**Implementation guidance:**
- In `src/lib/fonts.ts`:
  - Remove League Spartan import
  - Add `Plus_Jakarta_Sans` from `next/font/google` with weights [500, 600, 700] and subsets ["latin"]
  - Assign to CSS variable `--font-plus-jakarta-sans`
  - Keep Inter, Antonio, Geist Mono unchanged
- In `src/app/layout.tsx`:
  - Replace League Spartan variable class with Plus Jakarta Sans variable class on `<html>`
  - Add font preload: `<link rel="preload" href="..." as="font" type="font/woff2" crossOrigin="anonymous" />`
- In `src/app/globals.css`:
  - Update `--font-display: var(--font-plus-jakarta-sans)` (was League Spartan)
  - Add to `@theme inline`: `--font-heading: var(--font-plus-jakarta-sans);`
  - Define `@utility font-heading { font-family: var(--font-heading); }`
  - Define heading scale utilities with `text-wrap: balance`:
    ```
    @utility text-h1 { font-size: 2rem; line-height: 1.2; font-weight: 600; text-wrap: balance; }
    @utility text-h2 { font-size: 1.5rem; line-height: 1.3; font-weight: 600; text-wrap: balance; }
    @utility text-h3 { font-size: 1.25rem; line-height: 1.4; font-weight: 500; text-wrap: balance; }
    ```
  - Define `@utility tabular-nums { font-variant-numeric: tabular-nums; }`
- Update `CLAUDE.md`: change "League Spartan (display/headings)" to "Plus Jakarta Sans (headings)"

**Test requirements:**
- Unit test: verify `font-heading` class resolves to Plus Jakarta Sans font-family
- Visual comparison: render hero section, restaurant header, orders page — confirm Plus Jakarta Sans headings create sufficient hierarchy against Inter body
- Verify `text-wrap: balance` doesn't cause unexpected line breaks on medium-length headings at 375px

**Integration:** The 22 files already using `font-heading` will immediately start rendering in Plus Jakarta Sans — no file edits needed for those.

**Demo:** Hero section heading "Discover local restaurants" renders in Plus Jakarta Sans. All headings across the app use the new font. Body text remains Inter. The `font-heading` class (used 22 times) now actually produces CSS output.

---

### Step 3: Button Component Polish

**Objective:** Add hover brightness, active scale feedback, explicit transition properties, cursor-pointer, and dual secondary variant behavior.

**Implementation guidance:**
- In `src/components/ui/button.tsx`:
  - Add to base CVA string: `cursor-pointer transition-[background-color,transform,box-shadow] duration-200 ease-out`
  - Remove existing `transition-all` if present (anti-pattern per Web Interface Guidelines)
  - Add to base: `active:scale-[0.98]`
  - Default variant: replace `hover:bg-primary/90` with `hover:brightness-110`
  - Destructive variant: replace `hover:bg-destructive/90` with `hover:brightness-110`
  - Secondary variant: change to `bg-transparent border border-primary text-primary hover:bg-primary/5`
  - Add compound variant for secondary + pill shape: keep existing `bg-secondary text-secondary-foreground hover:bg-secondary/80` (customer portal convention)
  - Ghost variant: `hover:bg-primary/5 hover:text-foreground` (prepare for accent migration in Step 6)
  - Outline variant: `hover:bg-primary/5 hover:text-foreground` (prepare for accent migration)
- In `src/app/globals.css`, add reduced motion support:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
  ```

**Test requirements:**
- Unit test: verify button renders with `cursor-pointer`, `duration-200`, `ease-out`, `active:scale-[0.98]`
- Unit test: default variant includes `hover:brightness-110`
- Unit test: secondary + default shape renders transparent border; secondary + pill renders solid bg
- Verify `prefers-reduced-motion` media query disables transforms
- Visual: click a primary button — confirm press feedback feels snappy (scale 0.98 at 200ms)

**Integration:** All buttons across the app immediately get the new hover/active behavior. The compound variant for secondary+pill preserves customer portal button appearance.

**Demo:** Primary buttons show brightness increase on hover and subtle press animation on click. Secondary buttons in admin show transparent-border style. Secondary pill buttons on customer pages remain solid. Ghost buttons show warm `primary/5` tint on hover.

---

### Step 4: Card Hover Elevation + Restaurant Card Image Ratio

**Objective:** Add shadow elevation on card hover and update restaurant card image aspect ratio.

**Implementation guidance:**
- In `src/components/ui/card.tsx`:
  - Add to base Card class: `transition-[box-shadow] duration-200 ease-out`
  - Do NOT add hover:shadow-md to the base Card — not all cards need hover elevation (stat cards, form cards)
- In `src/features/discovery/components/restaurant-card.tsx`:
  - Add to Card: `hover:shadow-md cursor-pointer`
  - Change cover image container from `h-32 w-full` to `aspect-[3/2] w-full` for vertical grid context
  - Keep `h-32` for horizontal scroll cards (pass a `compact` prop or use a separate variant)
  - Ensure `<Image>` has explicit `width` and `height` attributes (or `fill` with `sizes`)
  - Ensure card has `rounded-lg` (radius-lg per spec)
  - Add padding `p-4` to content section (currently `p-3 pt-2`)
- In `src/features/saved-restaurants/components/saved-restaurant-card.tsx`:
  - Add `hover:shadow-md cursor-pointer` to card
  - Add transition class
- In `src/features/menu/components/menu-item-card.tsx`:
  - Already has `hover:bg-muted/50` — add `cursor-pointer` if missing

**Test requirements:**
- Unit test: restaurant card renders with `hover:shadow-md` and `cursor-pointer`
- Unit test: verify aspect-[3/2] class on cover image container
- Visual: hover over restaurant card — shadow elevates smoothly
- Visual: compare card density at 375px — verify 3:2 ratio shows adequate cards above fold

**Integration:** Builds on Step 1 (tokens) for shadow values. Card transition utility from base Card component is reused.

**Demo:** Hovering a restaurant card on the home page shows smooth shadow elevation. Restaurant card images are taller (3:2) giving food photos more visual presence. Saved restaurant cards also elevate on hover.

---

### Step 5: Badge/Chip Normalization + Input Padding

**Objective:** Add a `chip` badge variant for cuisine tags and fix input field padding.

**Implementation guidance:**
- In `src/components/ui/badge.tsx`:
  - Add `chip` variant: `"bg-muted text-muted-foreground rounded-xl px-2.5 py-1.5 text-xs font-normal"`
  - Keep existing variants unchanged
- Update all cuisine tag usages to use `variant="chip"`:
  - `src/features/discovery/components/restaurant-card.tsx` — cuisine badges (currently `variant="secondary"` with custom classes `text-[10px] font-normal px-1.5 py-0`)
  - `src/features/saved-restaurants/components/saved-restaurant-card.tsx` — cuisine badges
  - `src/features/discovery/components/hero-section.tsx` — if cuisine pills exist
  - Search page filter chips
- In `src/components/ui/input.tsx`:
  - Change `px-3 py-1` to `px-3 py-2` for closer alignment with 12px spec
  - Adjust height if needed: `h-10` (40px) to accommodate larger padding while meeting 44px touch target

**Test requirements:**
- Unit test: badge chip variant renders with `rounded-xl px-2.5 py-1.5 bg-muted`
- Unit test: input renders with updated padding
- Visual: cuisine tags on restaurant cards look consistent (all same size/shape)
- Visual: input fields have comfortable padding, focus state still works correctly

**Integration:** Builds on Step 1 (muted token now has correct hue 260).

**Demo:** Cuisine tags ("Cafe", "Japanese", "Croissants") render as consistent chips with muted background and rounded-xl corners across all card types. Input fields have more generous padding.

---

### Step 6: Accent Hover Migration Across UI Components

**Objective:** Update all components using `hover:bg-accent` or `focus:bg-accent` to use `hover:bg-primary/5` since accent is now orange.

**Implementation guidance:**

Systematically update each shadcn/ui component that references `accent`:
- `src/components/ui/dropdown-menu.tsx`: `focus:bg-accent focus:text-accent-foreground` → `focus:bg-primary/5 focus:text-foreground`
- `src/components/ui/select.tsx`: `focus:bg-accent focus:text-accent-foreground` → `focus:bg-primary/5 focus:text-foreground`
- `src/components/ui/command.tsx`: `aria-selected:bg-accent` → `aria-selected:bg-primary/5`
- `src/components/ui/navigation-menu.tsx`: `hover:bg-accent hover:text-accent-foreground` → `hover:bg-primary/5 hover:text-foreground`
- `src/components/ui/tabs.tsx`: Review — `data-[state=active]:bg-accent` may benefit from staying orange (active tab indicator). Evaluate visually.
- `src/components/ui/sidebar.tsx`: Keep `hover:bg-sidebar-accent` — sidebar has its own token system
- `src/components/ui/context-menu.tsx`: Same pattern as dropdown-menu
- `src/components/ui/menubar.tsx`: Same pattern as dropdown-menu
- `src/components/ui/tooltip.tsx`: Check if uses accent for bg

**Strategy:** Search the codebase for `bg-accent` and `text-accent-foreground` in all UI components. Replace hover/focus backgrounds with `bg-primary/5`. Replace corresponding text colors with `text-foreground` (since foreground on a near-transparent bg should be dark text, not white).

**Exception:** Active indicators (like active tab) can use `bg-primary/10` for a stronger warm tint.

**Test requirements:**
- Open a dropdown menu — items highlight with subtle warm orange tint, not full orange
- Open a select — same warm tint
- Tab component — active tab has visible but not overwhelming orange indicator
- Sidebar navigation — uses its own tokens, unchanged
- No white text on light orange backgrounds (would be illegible)

**Integration:** Depends on Step 1 (accent token is now orange). Button ghost/outline already handled in Step 3.

**Demo:** Open any dropdown, select, or command palette — hover/focus backgrounds show a subtle warm tint (`primary/5`) instead of the old gray or full orange. Active tabs have a slightly stronger warm indicator. Overall feel is cohesive warm, not aggressive orange.

---

### Step 7: Motion System + Sheet/Dialog Timing

**Objective:** Update sheet and dialog animation durations to spec range, ensure ease-out easing throughout.

**Implementation guidance:**
- In `src/components/ui/sheet.tsx`:
  - Find animation duration classes: replace `duration-500` (open) with `duration-[250ms]`
  - Replace `duration-300` (close) with `duration-200`
  - Replace `ease-in-out` with `ease-out` where applicable
- In `src/components/ui/dialog.tsx`:
  - Verify duration is within 150-250ms range
  - Ensure easing is `ease-out`
- In `src/components/ui/accordion.tsx`:
  - Verify `transition-all` is replaced with explicit properties if present
  - Acceptable: `transition-[height,opacity]` for accordion expand
- Verify the global `prefers-reduced-motion` media query (added in Step 3) covers all animation

**Test requirements:**
- Open/close a bottom sheet — feels snappy but not abrupt (250ms open, 200ms close)
- Open/close a dialog — smooth zoom-in at ~200ms
- Accordion expand/collapse feels responsive
- With `prefers-reduced-motion: reduce` enabled in browser, verify no visible animations

**Integration:** Independent of other steps. Can be done in parallel with Steps 4-6.

**Demo:** Open the cart drawer or checkout sheet — animation is noticeably faster and crisper than before. Dialogs open/close with smooth ease-out curves. Everything feels more responsive.

---

### Step 8: Hardcoded Value Cleanup + Touch Targets

**Objective:** Remove remaining hardcoded hex values and ensure mobile touch targets meet 44px minimum where critical.

**Implementation guidance:**
- In `src/app/globals.css`: verify `--primary` is now OKLCH (done in Step 1)
- In `src/features/branch-settings/components/qr-code-preview.tsx`:
  - Replace `#f8fafc`, `#0f172a`, `#e2e8f0`, `#475569` in print popup with CSS variable references or Tailwind classes
  - Replace `rgba(15, 23, 42, 0.12)` box-shadow with token-based shadow
  - Note: this is a print stylesheet — lower priority, don't block Phase 1 on it
- Replace all `text-[10px]` with `text-xs` across the codebase:
  - `src/components/layout/customer-bottom-nav.tsx`
  - Any other files using `text-[10px]` (audit found 10+ occurrences)
- Touch target audit:
  - Add `touch-action: manipulation` to `<main>` container in customer shell
  - Verify bottom nav items have minimum 44px tap area (use `min-h-[44px]` if needed)
  - Verify save/heart button on restaurant card meets 44px (currently `size-8` = 32px — increase to `size-10` = 40px or add padding)
  - Ensure `inputmode` attributes on relevant form inputs (tel, email, number)

**Test requirements:**
- Grep for `#[0-9a-fA-F]{3,8}` in non-SVG source files — should only find Google brand colors
- Grep for `text-\[10px\]` — should return zero results
- Visual: bottom nav labels render at 12px (text-xs) instead of 10px
- Touch: save button on restaurant card is comfortably tappable

**Integration:** Cleanup step — builds on all previous steps.

**Demo:** No hardcoded hex values remain in component files. Bottom nav labels are slightly larger and more readable. Restaurant card save button has a larger tap target.

---

### Step 9: Phase 1 Visual QA Gate

**Objective:** Screenshot every major page before/after Phase 1 changes and review for regressions.

**Implementation guidance:**
- Use Playwright or manual browser screenshots at 375px (mobile) and 1024px (desktop):
  - Home page (hero, restaurant cards, sections)
  - Restaurant detail page (header, menu, reviews)
  - Search page (input, filters, results)
  - Orders page (gradient, stats, order cards)
  - Saved restaurants page (gradient, cards)
  - Account page (profile, navigation links)
  - Login page (form, card)
  - Admin dashboard (stats, activity feed)
  - Menu management page (cards, category tabs)
- Compare before/after for:
  - Plus Jakarta Sans headings rendering correctly
  - Button hover/active states
  - Ghost/dropdown hover warmth (not too orange)
  - Card shadow elevation on hover
  - Restaurant card image ratio change (3:2)
  - Badge chip variant consistency

**Test requirements:**
- No broken layouts
- No illegible text (white-on-light from accent migration)
- No missing fonts
- Heading hierarchy clearly distinguishable from body text
- Overall feel: warm, appetizing, friendly — not generic, not aggressive

**Integration:** Gate check — do NOT proceed to Phase 2 until this passes.

**Demo:** Side-by-side before/after screenshots of all major pages, confirming Phase 1 changes look correct.

---

## Phase 2: Spacing Normalization

### Step 10: Card Padding Normalization

**Objective:** Update shadcn Card component defaults and all card usages from 24px to 16px padding per Design System spec.

**Implementation guidance:**
- In `src/components/ui/card.tsx`:
  - Change CardHeader/CardFooter: `px-6` → `px-4`
  - Change CardContent: `px-6` → `px-4`
  - Change Card: `py-6` → `py-4` (or adjust via CardHeader/Content/Footer gap)
  - Audit gap between sections: `gap-6` → `gap-4`
- Review every file importing Card to verify layout isn't broken:
  - Admin stat cards
  - Restaurant overview cards
  - Branch overview cards
  - Auth page cards
  - Order history cards
  - Account page cards
- Some cards may need their padding restored via className override if 16px is too tight for their content

**Test requirements:**
- Visual: all cards have 16px internal padding
- Visual: card content doesn't feel cramped — adequate whitespace between elements
- Build: `pnpm build` passes
- Manual: check auth login card, admin stat cards, order history cards at 375px

**Integration:** First spacing step. Affects many components — do this first to establish the new Card baseline.

**Demo:** Cards across the app have tighter, more compact padding (16px). Auth login form, admin dashboard stats, and order history all use consistent card spacing.

---

### Step 11: Gap and Spacing Grid Enforcement (Features)

**Objective:** Convert all non-8px-grid spacing values in `src/features/` to grid-aligned values.

**Implementation guidance:**

Work through each feature directory, applying these conversion rules:
| Non-grid | Replacement | Context |
|----------|------------|---------|
| gap-3 (12px) | gap-2 (8px) for tight contexts, gap-4 (16px) for standard | Between cards → gap-4, between badges → gap-2 |
| gap-1.5 (6px) | gap-1 (4px) or gap-2 (8px) | Micro elements → gap-1 |
| p-3 (12px) | p-2 (8px) for compact, p-4 (16px) for standard | Card content → p-4, inline elements → p-2 |
| p-5 (20px) | p-4 (16px) or p-6 (24px) | Standard sections → p-4, page sections → p-6 |
| py-3 (12px) | py-2 (8px) or py-4 (16px) | List items → py-2, sections → py-4 |
| px-3 (12px) | px-2 (8px) or px-4 (16px) | Inputs already addressed; containers → px-4 |
| space-y-3 (12px) | space-y-2 (8px) or space-y-4 (16px) | Tight lists → space-y-2, sections → space-y-4 |

Process features in order:
1. `src/features/discovery/` (home page, restaurant cards, hero)
2. `src/features/menu/` (restaurant detail, menu items)
3. `src/features/orders/` (order history, order cards)
4. `src/features/saved-restaurants/` (saved page, saved cards)
5. `src/features/customer-account/` (account page, profile)
6. `src/features/cart/` (cart drawer, cart items)
7. `src/features/checkout/` (checkout sheet)
8. `src/features/auth/` (login, register forms)
9. `src/features/menu-management/` (admin menu editor)
10. `src/features/admin/` (admin dashboard, management pages)
11. `src/features/restaurant-management/` (owner restaurant pages)
12. `src/features/branch-settings/` (branch settings)
13. Remaining features

**Test requirements:**
- Visual spot check of each feature's primary page after conversion
- No broken layouts or overlapping elements
- Verify cards in grid don't collapse or become too spaced
- `pnpm build` passes

**Integration:** Builds on Step 10 (card padding already normalized).

**Demo:** All feature components use 8px-grid spacing. Consistent visual rhythm across discovery, menu, orders, saved, account pages.

---

### Step 12: Gap and Spacing Grid Enforcement (App Routes + Components)

**Objective:** Convert non-8px-grid values in `src/app/` route files and `src/components/` shared components.

**Implementation guidance:**
- Process `src/app/` page and layout files:
  - `(public)/page.tsx` — home page layout spacing
  - `(public)/search/page.tsx` — search page
  - `(public)/restaurant/[slug]/` — restaurant pages
  - `(customer)/orders/`, `(customer)/saved/`, `(customer)/account/`
  - `(auth)/login/`, `(auth)/register/`
  - `(owner)/organization/` — all owner pages
  - `(admin)/` — all admin pages
- Process `src/components/`:
  - `layout/` — customer shell, subpage header, bottom nav
  - `ui/` — any remaining non-grid spacing in UI primitives
  - `brand/` — logo, price components
  - `feedback/` — loading components

**Test requirements:**
- Same as Step 11
- Full page load test for every route group

**Integration:** Completes the spacing normalization. All files now on 8px grid.

**Demo:** Every page in the app uses consistent 8px-grid spacing. Visual rhythm is uniform.

---

### Step 13: Arbitrary Value Removal + Page Margin Consistency

**Objective:** Remove all arbitrary pixel values and enforce consistent page margins.

**Implementation guidance:**
- Search for `\[\d+px\]` patterns and replace:
  - `text-[10px]` → `text-xs` (should be done in Phase 1, verify)
  - `w-[260px]` → `w-64` (256px) or responsive sizing
  - `w-[220px]`, `w-[180px]`, `w-[140px]` → responsive widths or Tailwind scale
  - `[3px]` padding/margin → `px-0.5` (2px) or `px-1` (4px)
  - `[10px]` → nearest grid value
  - `tracking-[0.24em]` → keep (letter-spacing, not a spacing grid concern)
- Normalize page margins:
  - Customer pages: `px-4` mobile, `md:px-6` desktop (consistent)
  - Admin pages: `p-4 md:p-6` (consistent)
  - Auth pages: `px-4 py-8` (consistent)
- Add max-width token if needed:
  - Define `@utility max-w-content { max-width: 75rem; }` (1200px) in globals.css
  - Or use `max-w-7xl` (1280px) as the standard — close enough to spec's 1200px

**Test requirements:**
- Grep for `\[\d+px\]` — only acceptable results are: letter-spacing, known exceptions
- Visual: pages have consistent left/right margins
- No horizontal scroll on any page at 375px

**Integration:** Final spacing cleanup step.

**Demo:** Zero arbitrary pixel values in spacing. Consistent page margins across all route groups.

---

### Step 14: Phase 2 Visual QA Gate

**Objective:** Screenshot review of all major pages after spacing normalization.

**Implementation guidance:**
- Same 9 pages as Step 9, at 375px and 1024px
- Overlay 8px grid on 3 representative pages (Home, Orders, Menu Management)
- Specific checks:
  - Card padding change (24px → 16px) doesn't feel cramped
  - gap conversions look natural
  - No broken layouts, no horizontal overflow
  - Restaurant card grid at new spacing looks good
  - Admin stat cards with tighter padding still readable

**Test requirements:**
- No layout breaks
- All pages pass 8px grid overlay check
- Before/after comparison shows improved consistency

**Integration:** Gate check — Phase 3 begins only after this passes.

**Demo:** Before/after screenshots showing spacing normalization. 8px grid overlay on representative pages confirming alignment.

---

## Phase 3: Admin Overhaul

> **Reminder:** Phase 3 requires a dedicated PDD session before implementation begins. The steps below are architectural direction — implementation details will be refined in that session.

### Step 15: Dedicated PDD Session for Phase 3

**Objective:** Run a full PDD planning session specifically for admin dashboard enhancements.

**Implementation guidance:**
- Research: audit current menu management flow end-to-end
- Requirements clarification topics:
  - Cross-category drag behavior (can items move between categories?)
  - Preview rendering for items without images
  - Inline editing + form validation interaction
  - Optimistic reorder rollback UX
  - Mobile touch drag thresholds
  - Whether admin portal should have a cooler color temperature (separate `--admin-*` tokens)
- Create detailed design document for Phase 3
- Create implementation plan for Phase 3

**Test requirements:** N/A — this is a planning step.

**Integration:** Output replaces the high-level Steps 16-20 with detailed implementation steps.

**Demo:** Completed design document and implementation plan for admin overhaul.

---

### Step 16: Database Schema + Reorder Mutations

**Objective:** Add `sort_order` columns and tRPC reorder mutations.

**Implementation guidance:**
- Add Drizzle schema changes for `sort_order` columns:
  - `categories`, `menu_items`, `modifier_groups`, `modifier_options`, `variants`
- Generate and run migration: `pnpm db:generate && pnpm db:migrate`
- Add repository methods: `reorder(items: { id: string; sortOrder: number }[])`
- Add service methods: `reorderCategories`, `reorderMenuItems`, etc.
- Add tRPC procedures: `category.reorder`, `menuItem.reorder`, `modifierGroup.reorder`, `modifierOption.reorder`
- Add `modifierOption.update` mutation (currently missing — needed for inline editing)
- Ensure all list queries ORDER BY `sort_order ASC`

**Test requirements:**
- Unit test: reorder service correctly updates sort_order values
- Unit test: update mutation validates input (name not empty, price >= 0)
- Integration test: reorder persists and list returns in new order
- Migration runs without error on existing data

**Integration:** Database foundation for Steps 17-19.

**Demo:** Categories and items can be reordered via direct API calls (tRPC). Existing data gets default sort_order = 0.

---

### Step 17: dnd-kit Integration + Category/Item Reordering

**Objective:** Add drag-and-drop reordering for menu categories and items.

**Implementation guidance:**
- Install `@dnd-kit/core` and `@dnd-kit/sortable`
- Create `SortableItem` wrapper component with drag handle (GripVertical icon)
- Wrap menu management category tabs with DndContext + SortableContext
- Wrap menu item grid with DndContext + SortableContext
- On drag end: call reorder mutation, optimistic update via TanStack Query
- Drag handle UX:
  - `touch-action: manipulation` on handles
  - Disable text selection during drag
  - Elevated shadow on dragged item
  - Drop target highlight
  - `cursor-grab` / `cursor-grabbing` states

**Test requirements:**
- Unit test: drag and drop reorders items correctly
- Integration test: reorder persists across page reload
- Touch test: drag works on mobile (touch hold → drag)
- Keyboard test: reorder via keyboard (Up/Down arrows in sortable context)

**Integration:** Builds on Step 16 (reorder mutations).

**Demo:** On the menu management page, drag a category tab to reorder. Drag a menu item card to reorder within its category. Changes persist.

---

### Step 18: Modifier Section Refactor

**Objective:** Move modifier groups from nested dialog to on-page collapsible sections.

**Implementation guidance:**
- Create `ModifierSection` component: collapsible sections for modifier groups
- Each group: Collapsible header (name + required badge + option count + drag handle) → expanded content (options list + add option form)
- Groups are sortable via dnd-kit
- Options within each group are sortable
- Replace `modifier-group-dialog.tsx` usage with on-page sections in the item edit view
- Keep dialog as fallback for mobile if the on-page layout is too complex at small viewports

**Test requirements:**
- Unit test: modifier section expands/collapses
- Unit test: options are reorderable within a group
- Integration test: full flow — add group, add options, reorder, save
- Visual: modifier sections don't crowd the edit form

**Integration:** Builds on Step 17 (dnd-kit) and Step 16 (reorder mutations).

**Demo:** On the menu item edit page, modifier groups appear as collapsible sections below the main form fields. Groups and options can be reordered by dragging.

---

### Step 19: Live Preview Panel + Inline Editing

**Objective:** Add a customer-facing preview panel to the menu item editor and inline editing for modifier options.

**Implementation guidance:**
- Create `MenuItemPreview` component that renders using the customer-facing `MenuItemCard` component
- Wire preview to form state via React Hook Form `watch()`
- Layout: side-by-side on xl+, below form on mobile
- Preview shows: image, name, description, price, modifier groups, options
- Preview updates in real-time as form fields change
- Inline editing for modifier options:
  - Create `InlineEditField` component (click to edit, blur/enter to save, escape to cancel)
  - Apply to option name and price fields
  - On save: call `modifierOption.update` mutation

**Test requirements:**
- Unit test: preview renders with current form values
- Unit test: inline edit saves on blur/enter, cancels on escape
- Integration test: preview updates live as user types in form
- Integration test: inline edit persists changes
- Visual: preview looks exactly like customer-facing menu item card

**Integration:** Builds on Steps 16-18.

**Demo:** While editing a menu item, a live preview panel on the right shows exactly how the item will appear to customers. Changing the name or price in the form instantly updates the preview. Modifier option names and prices can be edited by clicking directly on them.

---

### Step 20: Phase 3 Visual QA Gate

**Objective:** Final review of all admin dashboard changes.

**Implementation guidance:**
- Full E2E test of menu management workflow
- Drag-and-drop on desktop (mouse) and mobile (touch)
- Preview panel accuracy check
- Inline editing validation edge cases
- Verify admin pages still feel cohesive with customer portal

**Test requirements:**
- All Phase 3 acceptance criteria pass
- No regressions in customer-facing pages
- Admin dashboard feels professional and efficient (Notion/Linear/Stripe benchmark)

**Integration:** Final gate before merge.

**Demo:** Complete admin menu management workflow: create category, add item, upload image, configure modifiers with inline editing, reorder everything via drag-and-drop, verify customer preview — all in a single smooth flow.
