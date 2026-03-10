# Admin Dashboard Audit

## Overall Alignment: ~45%

## Page Inventory
- **Owner portal:** 12 pages (dashboard, restaurants, branches, menu, orders, settings, onboarding, payments, verify, profile)
- **Admin portal:** 6 pages (dashboard, restaurants, restaurant detail, users, verification queue, verification detail)
- **Components:** 8 menu management, 14 admin, 3 restaurant management

## Editing Patterns

### Current: Modal-Based Dialog Architecture
- All editing happens in Dialog modals (add category, add/edit item, variants, modifiers)
- NOT inline editing — modal opens, form submits, modal closes
- Sidebar form panels on branch detail page (xl+ screens)
- Admin uses toggle switches and dropdown menus for quick actions

### Spec Requirements vs Current

| Requirement | Status | Gap |
|-------------|--------|-----|
| Notion/Linear/Stripe aesthetic | 70% | More traditional dashboard feel |
| Edit while seeing result (live preview) | 0% | No preview panel at all |
| Structured hierarchy | 100% | Sidebar nav + breadcrumbs |
| Minimal cognitive load | 75% | Multiple dialog layers add friction |
| Immediate feedback | 100% | Toast notifications on all actions |
| Inline editing | 0% | All editing in modals |
| Expandable sections | 60% | Modifier groups collapsible but inside modal |
| Drag-and-drop ordering | 0% | No drag library installed, zero implementation |
| Modifier collapsible groups | 100% | Works in dialog |
| Inline option editing | 0% | Can add/delete but not edit existing |
| Drag handles | 0% | None |
| Visual preview panel | 0% | No customer-facing preview |
| Visual hierarchy | 100% | Title → actions → content → sidebar |

## Critical Gaps

1. **No drag-and-drop** — no library installed (dnd-kit, etc.)
2. **No live preview** — edit changes without seeing customer view
3. **Modifiers nested in modal** — can't see menu item while editing
4. **No inline editing** — everything modal-based
5. **Can't edit existing modifier options** — only delete/re-add

## Modifier Group Dialog Strengths
- Collapsible groups with expand/collapse
- Group-level "Required" setting
- Inline option addition (name + price + button)
- Keyboard Enter support
- Option count badge

## Modifier Group Dialog Gaps
- No drag handles for reordering
- Can't edit existing option text/price
- No visual feedback for "currently editing" group
- Nested in modal (not on main page)
