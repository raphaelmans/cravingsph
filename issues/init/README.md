# Initial UI Audit

Scope: customer landing and discovery entry flows starting at `/`.

Issue files:

- `001-discovery-cards-use-stub-data-and-break-on-detail-pages.md`
- `002-search-location-filter-is-not-functional.md`
- `003-scan-qr-cta-is-a-placeholder.md`
- `004-discovery-does-not-expose-save-for-later.md`
- `005-saved-restaurants-are-device-local-seed-data-not-account-data.md`
- `006-order-history-is-seeded-for-new-accounts-and-not-user-scoped.md`
- `007-reorder-from-order-history-routes-into-a-broken-restaurant-page.md`

Artifacts used:

- PRD: `docs/prd.md`
- Scaffold brief: `PROMPT_ORIGINAL.md`
- Scaffold design/spec: `specs/frontend-ui-scaffold/design.md`, `specs/frontend-ui-scaffold/requirements.md`
- Customer discovery stories: `user-stories/customer/discovery/*`
- Playwright audit against `http://localhost:3000/`
