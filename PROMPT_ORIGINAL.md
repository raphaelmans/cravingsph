# CravingsPH — Frontend UI Scaffold

## Objective

Scaffold the complete frontend for CravingsPH: all pages, components, route wirings, and state management across three portals (Customer, Owner, Admin) covering all 7 PRD phases. Use shadcn/ui with the established design system.

## Spec Directory

All design artifacts are in `specs/frontend-ui-scaffold/`:
- `design.md` — **primary reference**: routes, component trees, state, interfaces
- `plan.md` — 16-step implementation plan (follow in order)
- `requirements.md` — architectural decisions
- `research/legacy-component-mapping.md` — legacy→new component migration guide
- `research/reference-patterns.md` — reference repo patterns for sidebar/nav

## Key Requirements

1. **Route groups**: `(public)` customer, `(auth)` login/register, `(owner)` restaurant owner, `(admin)` platform admin
2. **Strict portal separation**: no portal switching between customer and owner
3. **Design system**: `shape="pill"` for customer buttons/inputs, `#f86006` orange brand, `<Price />` for amounts, `<Logo />` for wordmark
4. **Legacy patterns preserved**: bottom sheets for mobile interactions, smart cart merging, persistent localStorage cart, branch-scoped URLs
5. **Legacy improvements**: horizontal scroll category tabs (not dropdown), single MenuItemSheet with `mode` prop (not duplicate sheets), required modifier validation, fuzzy search
6. **Feature modules**: `src/features/{feature}/components/`, `hooks/`, `stores/`
7. **Server state**: tRPC + TanStack Query (no Zustand for server data)
8. **Client state**: Zustand cart store only, branch-scoped, persisted
9. **Owner sidebar**: collapsible Restaurant→Branch hierarchy, permission-filtered nav, badge counts
10. **Onboarding**: both wizard (linear) and hub (card grid) modes

## Acceptance Criteria

- Given a customer scans a QR code, when the page loads, then they see the menu without login
- Given a customer taps a category tab, when scrolling, then the page jumps to that section
- Given identical items are added to cart, when merged, then quantity increases instead of duplicating
- Given dine-in is selected at checkout, when the form renders, then only table number is shown
- Given an order is placed, when payment methods display, then copy buttons work for account numbers
- Given a new owner registers, when they first access /organization, then they are redirected to get-started
- Given the onboarding wizard completes, when all 7 steps are done, then the owner sees their dashboard
- Given a new order arrives, when the owner views Inbox, then accept/reject actions are available
- Given an admin reviews verification, when they approve, then the restaurant status updates

## Implementation Order

Follow `specs/frontend-ui-scaffold/plan.md` steps 1–16 sequentially. Each step builds on the previous and ends with demoable functionality. Do not skip steps.

## References

- PRD: `docs/prd.md`
- Implementation intent: `docs/implementation-intent.md`
- Legacy codebase: `/Users/raphaelm/Documents/Coding/startups/legacy-cravings/`
- Reference architecture: `/Users/raphaelm/Documents/Coding/boilerplates/next16bp/`
- User stories: `user-stories/`
