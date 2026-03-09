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
- `008-customer-accounts-can-enter-owner-portal-and-create-organizations.md`
- `009-owner-navigation-and-dashboard-link-to-missing-routes.md`
- `010-onboarding-wizard-can-finish-while-required-steps-remain-incomplete.md`
- `011-owner-order-dashboard-falls-back-to-seeded-shared-orders-for-any-branch.md`
- `012-owner-payments-start-with-seeded-organization-agnostic-methods.md`
- `013-owner-verification-seeds-uploaded-documents-and-under-review-state.md`
- `014-branch-settings-store-operating-hours-locally-and-not-in-backend.md`
- `015-breadcrumb-component-renders-invalid-list-markup-and-causes-hydration-errors.md`
- `016-admin-user-access-toggle-is-local-scaffold-only.md`
- `017-add-item-dialog-has-broken-defaults-and-optional-field-validation.md`
- `018-remote-item-images-can-crash-owner-and-customer-menu-pages.md`

Artifacts used:

- PRD: `docs/prd.md`
- Scaffold brief: `PROMPT_ORIGINAL.md`
- Scaffold design/spec: `specs/frontend-ui-scaffold/design.md`, `specs/frontend-ui-scaffold/requirements.md`
- Customer discovery stories: `user-stories/customer/discovery/*`
- Playwright audit against `http://localhost:3000/`
