# Auth & Routes — Research Notes

## Route Types

| Type | Routes | Auth Required |
|------|--------|---------------|
| public | `/`, `/search`, `/restaurant/[slug]`, `/restaurant/[slug]/order/[orderId]` | No |
| protected | `/orders`, `/saved`, `/account` | Yes |
| guest | `/login`, `/register`, `/magic-link`, `/post-login` | Blocks authenticated users |
| organization | `/organization/*` | Yes + owner role |
| admin | `/admin/*` | Yes + admin role |

## Auth Redirect Flow

```
Unauthenticated user hits /orders
  → proxy.ts redirects to /login?redirect=/orders
  → User logs in
  → proxy.ts sees authenticated user on /login (guest route)
  → Redirects to /post-login?redirect=/orders
  → post-login page redirects based on portalPreference
  → User lands on /orders
```

The `?redirect=` param is already wired end-to-end. Bottom nav just needs to navigate to the protected route — proxy handles the rest.

## Owner Detection

An "owner" is determined by:
1. `portalPreference === "owner"` AND has organization, OR
2. `portalPreference === null` AND has organization (legacy)

For portal switching in Account page: check if user has an organization via tRPC `organization.mine()`.

## useSession() Hook

```typescript
// Returns: { userId, email, role, portalPreference } | null
const { data: session } = useSession();
```
- Client-side via tRPC `auth.me`
- 5-minute stale time cache
- Returns null for unauthenticated users

## Key Files

- `src/common/app-routes.ts` — route definitions
- `src/proxy.ts` — auth redirect middleware
- `src/features/auth/hooks/use-auth.ts` — client hooks
- `src/shared/infra/supabase/session.ts` — server session
- `src/app/(auth)/post-login/page.tsx` — post-login routing
