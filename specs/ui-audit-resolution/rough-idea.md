# UI Audit Resolution — Production Readiness

Resolve all 18 issues from the initial UI audit (`issues/init/`) to make the CravingsPH platform production-ready.

## Scope

The audit covers customer landing/discovery entry flows, owner portal workflows, and admin scaffolding. Issues range from high-severity broken funnels (stub data routing to errors) to medium-severity local-only state and invalid markup.

## Issue Summary

### Customer-Facing (Issues 001–007)
1. Discovery cards use stub data and break on detail pages (high)
2. Search location filter is not functional (medium)
3. Scan QR CTA is a placeholder (high)
4. Discovery does not expose save-for-later (medium)
5. Saved restaurants are device-local seed data, not account data (high)
6. Order history is seeded for new accounts and not user-scoped (high)
7. Reorder from order history routes into a broken restaurant page (high)

### Security / Portal Separation (Issue 008)
8. Customer accounts can enter owner portal and create organizations (high)

### Owner Portal (Issues 009–014)
9. Owner navigation and dashboard link to missing routes (high)
10. Onboarding wizard can finish while required steps remain incomplete (high)
11. Owner order dashboard falls back to seeded shared orders for any branch (high)
12. Owner payments start with seeded organization-agnostic methods (medium)
13. Owner verification seeds uploaded documents and under-review state (high)
14. Branch settings store operating hours locally and not in backend (medium)

### Shared Components (Issue 015)
15. Breadcrumb component renders invalid list markup and causes hydration errors (medium)

### Admin (Issue 016)
16. Admin user access toggle is local scaffold only (medium)

### Menu Management (Issues 017–018)
17. Add item dialog has broken defaults and optional field validation (high)
18. Remote item images can crash owner and customer menu pages (high)

## Skills to Apply

- **playwright-cli**: Browser verification of each fix
- **frontend-design**: UI quality and component design
- **copywriting**: Microcopy, empty states, error messages
- **product-designer**: UX flows and interaction design
- **ui-ux-pro-max**: Visual polish and design system consistency
