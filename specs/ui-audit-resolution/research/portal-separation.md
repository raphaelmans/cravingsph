# Portal Separation & Auth Flow

## Current Vulnerability
Any customer can navigate to /organization/get-started, create an org, and operate as owner.
Root cause: owner layout only checks session + org existence, not portal entitlement.

## Auth Flow
1. Register (customer or owner) → same auth.register mutation
2. Owner form stores org name in localStorage ("cravings:pending-org-name")
3. Post-login: checks role=admin → /admin, else hasOrg → /organization, else → /
4. Owner layout: requireSession() + check hasOrganization, NO role check
5. organization.create: protectedProcedure only, any authenticated user can call

## Fix Points

### Database
- Add `portal_preference` varchar to profile table ('customer' | 'owner')

### Registration
- Customer register → set portal_preference = 'customer'
- Owner register → set portal_preference = 'owner'

### Owner Layout (src/app/(owner)/layout.tsx)
- After requireSession(), check profile.portal_preference === 'owner'
- Redirect to / if not owner

### Organization Router
- organization.create: check portal_preference === 'owner' before allowing

### Post-Login (src/app/(auth)/post-login/page.tsx)
- Use portal_preference if present, fall back to org check

### Session Type
- Add portal_preference to Session interface in src/shared/kernel/auth.ts
- Load from profile in src/shared/infra/supabase/session.ts

## Dead Owner Nav Links (Issue 009)
These routes 404: /organization/orders, /organization/team, /organization/settings, /organization/profile
Fix: Create the route pages or disable/hide links until routes exist.

## Onboarding Wizard (Issue 010)
Steps 4-6 skip with "Skip for Now" but step 7 says "You're All Set!"
Fix: Don't show completion message until required steps are done. Use same source of truth as hub.
