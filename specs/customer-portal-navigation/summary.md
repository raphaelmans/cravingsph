# Summary — Customer Portal Navigation

## Artifacts

| File | Purpose |
|------|---------|
| `specs/customer-portal-navigation/rough-idea.md` | Consolidated problem statement from 7 issues |
| `specs/customer-portal-navigation/requirements.md` | 10 Q&A decisions shaping the design |
| `specs/customer-portal-navigation/research/existing-layout-system.md` | Audit of CustomerShell, headers, layout components |
| `specs/customer-portal-navigation/research/ad-hoc-headers-audit.md` | Detailed comparison of all 5 ad-hoc headers |
| `specs/customer-portal-navigation/research/design-tokens-and-components.md` | Button sizes, color tokens, z-index scale |
| `specs/customer-portal-navigation/research/auth-and-routes.md` | Route types, auth redirect flow, owner detection |
| `specs/customer-portal-navigation/design.md` | Full design: architecture, components, acceptance criteria |
| `specs/customer-portal-navigation/plan.md` | 12-step implementation plan with tests and demos |

## Overview

The customer portal currently has no persistent navigation — users are trapped on their entry page with no way to reach auth, orders, saved restaurants, or account settings. This spec adds:

- **Brand header** (logo + cart + auth) on tab pages, **subpage header** (back + title) on deep pages
- **Bottom navigation** (Home, Orders, QR scan FAB, Saved, Account) — always visible
- **Hard cutover** replacing 5 ad-hoc headers with a shared `SubpageHeader` component
- **Portal switching** for owner-role users on the Account page
- **Accessibility** landmarks, skip-to-content, single `<main>`
- **Design token compliance** replacing hardcoded `#fff8f2` with `from-peach`

## Key Decisions

1. All 7 issues in one unified spec
2. 4 tabs + center QR FAB (no Search tab)
3. Bottom nav always visible on all pages
4. Guests tap protected tabs → existing proxy redirect handles auth
5. `router.back()` for back navigation
6. Light mode only, tokens for correctness
7. shadcn/ui size variants for touch targets

## Next Steps

- Review and approve the spec
- Implement via `ralph run` or manual development following the 12-step plan
