# Table-first Dine-in MVP (PRD v2 Track A)

## Objective

Implement the complete dine-in ordering system for CravingsPH. Customers scan a table QR code, browse the menu with ordering enabled, and submit anonymous immutable tickets. Owners manage tables, progress tickets through a 4-state lifecycle, and close sessions. Browse-only mode is enforced for all non-QR visitors. Deferred features are hidden behind feature flags. Search gains a dual-mode Food | Restaurant toggle. Owner onboarding becomes invite-only.

## Key Requirements

- Tables belong to branches. Each table has a `publicId` (nanoid) used in QR codes encoding `/t/{publicId}`.
- Table sessions auto-create when a customer scans a valid table QR (no staff-gated open step). Sessions remain active until staff closes them.
- `menu_context` capability contract determines browse vs dine-in mode. Browse mode disables cart/submit and shows a CTA.
- Order submission is anonymous (`publicProcedure`), validated against an active table session. No login required.
- Idempotency key prevents duplicate ticket creation. Item/modifier availability re-checked at submit time.
- Human-readable ticket codes (e.g., "A-042") generated per ticket.
- 4-state lifecycle: `new → preparing → ready → completed`. No "accepted" step. Cancel from any state.
- "Mark as Paid (Cash)" shortcut for dine-in tickets.
- Feature flags (env vars, all `false`): `FF_SAVED_RESTAURANTS`, `FF_REVIEWS`, `FF_ORDER_HISTORY`, `FF_DIGITAL_PAYMENTS`, `FF_ORDER_AHEAD`.
- Verification and payment config removed from onboarding wizard.
- Dual-mode search: Food mode searches menu item names, returns restaurants with matched dishes. Restaurant mode is existing behavior plus barangay filter.
- Branch schema gains `street`, `barangay`, `amenities` (jsonb). Operating hours support multiple time ranges per day.
- Invite-only onboarding: admin generates invite link, owner registers via token.

## Acceptance Criteria

```gherkin
Given an owner with a configured branch
When they create a table with number "T1"
Then the table appears in the list with a unique publicId and downloadable QR code

Given a customer scans a valid table QR
When the bootstrap endpoint resolves
Then a table session is auto-created or resumed
And menu_context returns mode "dine_in" with canAddToCart true

Given a customer visits /r/{slug} directly
When the page loads
Then menu_context is "browse" with cart disabled and a "Scan QR to order" CTA

Given a customer with a valid dine-in session submits an order
When the backend processes the submission
Then a ticket is created with ticketCode, tableSessionId, status "new"
And item/modifier availability is validated server-side
And idempotency key prevents duplicate creation

Given a customer submits against a closed table session
When the backend processes the submission
Then a SessionClosedError is returned

Given a ticket exists
When the owner progresses status from new to preparing to ready to completed
Then each transition is recorded in the audit trail

Given all feature flags are false
When a customer navigates the app
Then saved restaurants, reviews, order history, payment proof, and pickup UI are not visible

Given a customer searches in Food mode for "croiss"
When results load
Then restaurants with menu items matching "croissant" are shown with matched dish names

Given an admin generates an invite link for an email
When the restaurant owner opens the link and registers
Then they gain access to the owner portal with a simplified onboarding wizard
```

## Reference

All specs are in `specs/prd-v2-track-a/`:
- `design.md` — detailed design with data models, interfaces, error handling, architecture
- `plan.md` — 20-step implementation plan with test requirements per step
- `research/` — 8 codebase research documents

Source PRDs: `docs/prd-v2.md`, `cravings-prd-v4.md` (v4 prioritized on conflicts).
