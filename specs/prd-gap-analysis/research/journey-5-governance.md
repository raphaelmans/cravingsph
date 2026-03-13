# Journey 5 — Governance & Maturity: Audit Findings

## Summary

**3/6 core requirements fully implemented, 2 partial, 1 missing.**

Admin access control and invitation system are solid. Main gaps: verification flow conflicts with curated model, platform monitoring is bare-bones.

---

## Detailed Findings

### 1. Curated platform model (no public owner registration)
**Status:** ✅ Implemented
- Owner registration at `/register/owner` requires invitation token
- Form validates token via `trpc.invitation.validate`; shows "Invitation Required" error if missing
- Customer registration at `/register` remains public (correct)
- No backdoor registration paths

### 2. Admin invitation system
**Status:** ✅ Implemented
- `src/modules/invitation/invitation.router.ts` — admin-only `create`, public `validate`, protected `accept`
- Generates secure token via `crypto.randomBytes(32)`
- 7-day default expiration (configurable 1-30 days)
- Admin UI: `src/features/admin/components/admin-invitations-page.tsx` — create/list/revoke invitations, copy URLs, status badges
- Schema tracks: token, status (pending/accepted/expired), createdBy, acceptedBy, email, restaurantName

### 3. Admin responsibilities (manage restaurants, users, monitor)
**Status:** 🟡 Partial

**Implemented:**
- Admin dashboard with stat cards (total restaurants, pending verifications, orders today, total users)
- Restaurant management: view/filter/edit/toggle featured/active
- User management: view/search/filter/suspend/restore
- Verification queue monitoring
- Admin sidebar navigation

**Missing:**
- No trend analysis or growth curves
- No user activity logging (login frequency, order patterns)
- No restaurant performance tracking (order volume, revenue)
- "Orders today" shows "--" (backend procedure not wired)
- No admin action audit trail

### 4. Platform monitoring
**Status:** ❌ Minimal/Missing
- Only basic health check endpoint (status/timestamp/uptime)
- Dashboard shows basic counts only
- No operational metrics, error rates, or system health monitoring
- No real-time alerts or configurable thresholds

### 5. Verification flow (PRD says remove)
**Status:** 🟡 Still present — potential misalignment
- Full verification module exists: `src/modules/verification/` (upload docs, submit, review)
- Requires 3 docs: business_registration, valid_government_id, business_permit
- Admin can approve/reject
- **Architectural conflict**: Current flow is `Invite → Register → Submit Docs → Admin Reviews`. PRD intent suggests `Admin Vets → Invites → Registration Complete`. The document submission step may reverse the curation intent.

### 6. Admin access control
**Status:** ✅ Implemented
- `adminProcedure` in tRPC enforces `session.role === "admin"`
- Route protection via Next.js route groups + middleware
- All admin endpoints properly gated

---

## Key Gaps to Close

### Decision Required
1. **Verification flow scope** — Should the document verification flow be kept, simplified, or removed entirely? PRD implies restaurants are pre-vetted before invitation, making post-registration verification potentially redundant. This needs a product decision.

### Medium Priority
2. **Dashboard metrics** — Wire up "Orders today" count and add basic trend data
3. **Admin audit trail** — Log admin actions (approvals, suspensions, invitation creation)

### Future (explicitly out of MVP scope per PRD)
- Team access for restaurant staff
- Operational analytics dashboards
- Notifications/realtime infrastructure
