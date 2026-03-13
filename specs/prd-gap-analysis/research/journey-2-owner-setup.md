# Journey 2 — Owner Setup & Launch Readiness: Audit Findings

## Summary

**7/10 requirements fully implemented, 3/10 partial, 0 missing at critical level.**

The invite-only onboarding model is correctly implemented. The main gaps are around cuisine type input format and branch media uploads.

---

## Detailed Findings

### 1. Invite-only onboarding
**Status:** ✅ Implemented
- Invitation schema: `src/shared/infra/db/schema/invitation.ts` — token, status (pending/accepted/expired), email, restaurantName, expiresAt
- Invitation router: `src/modules/invitation/invitation.router.ts` — admin-only `create`, public `validate`, protected `accept`
- Owner register form: `src/features/auth/components/owner-register-form.tsx` — requires token; shows "Invitation Required" error if missing
- Admin invitations page: `src/features/admin/components/admin-invitations-page.tsx` — full UI for generating/listing/revoking

### 2. Owner account activation (Name, Email, Password)
**Status:** ✅ Implemented
- Form collects email & password correctly
- Organization Name collected (not individual owner name — may be intentional)

### 3. Create organization (Name only)
**Status:** ✅ Implemented
- `src/features/onboarding/components/organization-form.tsx` — minimal form with only `name` field
- Org name pre-filled from registration localStorage

### 4. Add restaurant (Name + Cuisine types multi-select)
**Status:** 🟡 Partial
- Restaurant name: ✅
- Cuisine type: ❌ **Currently a single text input**, not multi-select
- Schema `cuisineType` is `varchar`, not array
- **Missing**: Predefined options (Filipino, Japanese, Korean, etc.), multi-select UI

### 5. Create branch
**Status:** 🟡 Partial

| Sub-requirement | Status | Notes |
|---|---|---|
| 5a. Branch name format (locked prefix) | ✅ | Correct — shows "Restaurant Name -" prefix, user inputs suffix only |
| 5b. Address fields | ✅ | All 5 fields present (address, street, barangay, city, province) |
| 5c. Media (profile pic + cover) | ❌ | Schema only has `coverUrl`, no `profileUrl`. No upload UI in form |
| 5d. Amenities with icons | ✅ | 4 amenities with icons (Snowflake, CircleParking, Wifi, TreePine) |
| 5e. Operating hours (multi-slot/day) | ✅ | Up to 4 slots per day, per-day schedules supported |

### 6. Build menu (categories, items, modifiers)
**Status:** 🟡 Partial
- Menu builder step in onboarding is a **placeholder** that says "available from dashboard after setup"
- Full menu module exists at `src/modules/menu/` — usable post-onboarding
- Modifiers system exists but not verified in onboarding flow

### 7. Branch settings (ordering toggle only for MVP)
**Status:** ✅ Implemented
- `isOrderingEnabled` toggle present in settings UI
- `autoAcceptOrders` and `paymentCountdownMinutes` removed from UI (still in schema but not exposed)

### 8. Remove public owner registration
**Status:** ✅ Implemented
- `/register` routes to customer registration only
- `/register/owner?token=...` is token-gated

### 9. Remove payment method setup
**Status:** ✅ Implemented
- Payment methods step is skip-only placeholder in onboarding

### 10. Remove verification documents
**Status:** ✅ Implemented
- Verification step is skip-only placeholder in onboarding

---

## Key Gaps to Close

### High Priority
1. **Cuisine Type Multi-Select** — Change from text input to multi-select with predefined options (Filipino, Japanese, Korean, Chinese, French, Italian, Mexican, Cafe, Bakery). Update schema from varchar to array, update DTO to `z.array(z.enum(...))`.

2. **Branch Profile Picture** — Add `profileUrl` field to branch schema, add image upload UI to branch form and settings.

### Medium Priority
3. **Menu Builder in Onboarding** — Currently deferred to dashboard. Consider if MVP should include basic menu setup during onboarding or keep as-is.
