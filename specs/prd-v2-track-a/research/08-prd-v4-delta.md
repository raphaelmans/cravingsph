# Research: PRD v4 Delta Analysis

Comparing `cravings-prd-v4.md` (product guide v4) against `docs/prd-v2.md` and `plans/prd-v2-track-a.md`.

## Critical Deltas

### 1. Invite-Only Onboarding (NEW in v4)

**v4 says:** Restaurant owners cannot publicly self-register. Access is invite-only via admin-generated links.
**v2 says:** Self-service onboarding (US-39 through US-45) with verification queue.
**Impact:** Fundamentally changes the owner onboarding flow. Removes: public registration, verification documents, verification queue. Adds: admin invite link generation, invite-based account activation.
**Affected code:** `src/modules/auth/`, `src/modules/verification/`, `src/features/verification/`, `src/features/onboarding/`, admin verification queue.

### 2. Branch Settings Simplification (v4 strips)

**v4 says:** Auto-accept and payment countdown are "not required for MVP and should be removed unless a strong operational need emerges." Only ordering on/off toggle needed.
**v2 says:** Auto-accept wiring (US-62), payment countdown, branch controls as features.
**Track A Phase 5 says:** Wire auto-accept for branches that opt in.
**Impact:** Simplifies branch settings. Auto-accept toggle and payment countdown may be removed from UI (or feature-flagged). This conflicts with Phase 5 acceptance criteria.

### 3. Simplified Order Status (v4 simplifies)

**v4 says:** Order statuses are: New → Preparing → Ready → Completed (4 states). No "accepted" step.
**v2 says:** placed → accepted → preparing → ready → completed (5 states), with auto-accept skipping "accepted".
**Impact:** If "accepted" is removed entirely, the status machine simplifies. But the existing codebase has "accepted" baked into the state machine, UI tabs, and timeline. This needs a decision.

### 4. Table Session Model (v4 simpler)

**v4 says:** Customer scans QR → system creates a table session automatically. No mention of staff opening/closing sessions.
**v2 says:** Staff explicitly opens table sessions (US-56, US-57). QR only works if staff has opened the session. Device sessions are minted per browser.
**Impact:** Major architectural difference. v4 implies QR scan = instant session (no staff gate). v2 has a two-step: staff opens → then QR works. This needs founder clarification.

### 5. Verification & Documents Removal (v4 strips)

**v4 says:** "Remove verification documents" and "Remove public restaurant registration."
**v2 says:** Verification flow (US-43, US-44) with admin review queue.
**Impact:** If invite-only, verification queue becomes unnecessary (admin already vetted the restaurant). Existing verification code can be removed or hidden.

### 6. Payment Method Setup Removal (v4 strips)

**v4 says:** "Remove payment method setup" from onboarding.
**v2 says:** Payment method config stays owner-only, "Mark as Paid (Cash)" for v1.
**Impact:** Aligns with v2's deferred payments, but v4 goes further — remove from onboarding entirely, not just hide.

### 7. Address Fields Enhancement (v4 adds)

**v4 says:** Structured address: address line, street, barangay, city/municipality, province.
**Current schema:** `address` (text), `city` (varchar), `province` (varchar). No street or barangay fields.
**Impact:** Schema migration needed to add `street` and `barangay` columns. Discovery search filtering by barangay (instead of city) aligns with v4's search spec.

### 8. Branch Amenities (NEW in v4)

**v4 says:** Selectable amenities: air conditioning, parking, free WiFi, outdoor seating.
**v2 says:** No mention of amenities.
**Impact:** New schema (branch_amenities or jsonb column), new UI in branch settings, potentially shown on restaurant page.

### 9. Split Operating Hours (v4 requires)

**v4 says:** Must support multiple time ranges per day (e.g., Monday 8AM-12PM AND 4PM-10PM).
**Current schema:** One row per `(branchId, dayOfWeek)` with single `opensAt`/`closesAt`. Unique index enforces one range per day.
**Impact:** Schema change needed — either allow multiple rows per day (remove unique index) or change to jsonb array of time ranges.

### 10. Cuisine as Multi-Select (v4 clarifies)

**v4 says:** Cuisine types should be multi-select with predefined suggestions, but allow flexible additions.
**Current schema:** `restaurant.cuisineType` appears to be a single comma-separated string.
**Impact:** May need a proper multi-select UI and normalized storage (or continue with comma-separated).

### 11. Browse Mode / Capability Model (v4 lighter)

**v4 says:** QR scan creates session → ordering enabled. Discovery → browse only. No explicit `menu_context` contract described.
**v2 says:** Detailed `menu_context` contract with mode, `can_add_to_cart`, `can_submit_order`, session IDs.
**Impact:** v4 doesn't contradict v2's capability model — it just doesn't describe it at this detail level. The `menu_context` approach from v2 is an implementation detail that v4's product guide wouldn't cover.

### 12. Device Sessions (v4 silent)

**v4 says:** Nothing about device sessions or multi-device same-table scenarios.
**v2 says:** deviceSession entity, multi-device support (US-30, FR-04).
**Impact:** v4 doesn't contradict — it's just a product guide that doesn't go to this detail. Multi-device is an edge case that v2 already spec'd.

### 13. No Feature Flags Mentioned (v4 says "remove")

**v4 says:** "Remove" payment setup, verification, etc. — implies actual removal.
**v2 says:** Feature flags to hide UI entry points, keep code for extensibility.
**Impact:** Style difference. v4 is more aggressive about removing. v2 preserves for future. Engineering decision: feature-flag (v2) vs. hard remove (v4). Feature flags are safer and align with v2's extensibility principle.

## Items v4 Aligns With v2

- Dine-in first, table-first MVP scope
- QR-to-order flow as primary ordering path
- Browse-only for discovery/direct URLs
- Immutable tickets (additional orders = new tickets)
- Dual-mode search (Food | Restaurant)
- Query persistence across search modes
- Barangay/location-based search filtering
- Cash-only payments for v1
- No public self-registration for restaurants in v1

## Decisions — RESOLVED (v4 prioritized)

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Table session gating | **Auto-create on QR scan.** No staff-gated sessions. Simplifies Phase 2. |
| 2 | Order status states | **4 states: new → preparing → ready → completed.** Remove "accepted" step. |
| 3 | Auto-accept toggle | **Remove from v1.** All orders auto-progress. |
| 4 | Deferred features | **Remove** payment setup, verification from UI. Feature flags for saved/reviews/order history. |
| 5 | Onboarding model | **Invite-only.** Admin generates invite links. No public registration. |
| 6 | Split operating hours | **Support multiple time ranges per day.** Schema migration needed. |
| 7 | Branch amenities | **Add for v1.** A/C, parking, WiFi, outdoor seating. |
| 8 | Structured address | **Add street + barangay fields.** Schema migration needed. |
