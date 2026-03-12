# Research: Auth & Middleware

## Route-Based Access Control (`src/proxy.ts`)

- Next.js middleware (not edge runtime)
- Refreshes Supabase session on every request
- Flow: extract user → if no user + protected route → redirect to login → if user + guest route → redirect to post-login
- **No role/organization checks at proxy level** — only user existence
- Sets `x-pathname` header for tracing

## Route Groups (`src/common/app-routes.ts`)

| Type | Routes | Behavior |
|------|--------|----------|
| public | `/`, `/restaurant/[slug]`, `/search` | No auth |
| guest | `/login`, `/register`, `/magic-link` | Redirects if authenticated |
| protected | `/orders`, `/saved`, `/account`, `/post-login` | Auth required |
| organization | `/organization/**` | Auth + org membership |
| admin | `/admin/**` | Auth + admin role |

Helpers: `getRouteType()`, `isProtectedRoute()`, `isGuestRoute()`, `matchesRoute()`

## tRPC Procedure Types (`src/shared/infra/trpc/trpc.ts`)

| Procedure | Auth | Role | Middleware Chain |
|-----------|------|------|------------------|
| `publicProcedure` | None | None | logger |
| `protectedProcedure` | Required | Any | logger → auth |
| `adminProcedure` | Required | admin | logger → auth → admin |

**Auth middleware:** Checks `ctx.session` and `ctx.userId`, throws `UNAUTHORIZED` with `AuthenticationError` if missing.

**Admin middleware:** Checks `ctx.session.role === "admin"`, throws `FORBIDDEN` with `AuthorizationError` if not admin.

## tRPC Context (`src/shared/infra/trpc/context.ts`)

```ts
interface Context {
  requestId: string;
  session: Session | null;
  userId: string | null;
  cookies: CookieMethodsServer;
  origin: string;
  log: Logger;
}

interface Session {
  userId: string;
  email: string;
  role: UserRole;  // "admin" | "member" | "viewer"
  portalPreference: PortalPreference | null;  // "customer" | "owner"
}
```

Session creation: Supabase `getUser()` → fetch role from `user_roles` → fetch portal from `profile` → construct Session.

**RequestContext** (for service layer): `{ tx?: TransactionContext, requestId?: string }`

## Supabase Auth (`src/modules/auth/`)

- `AuthService` wraps Supabase auth client
- Methods: `signIn`, `signInWithMagicLink`, `startGoogleOAuth`, `signUp`, `signOut`, `exchangeCodeForSession`
- `RegisterUserUseCase` orchestrates: Supabase signup → create user_role → create/update profile
- Custom errors: `InvalidCredentialsError`, `EmailNotVerifiedError`, `UserAlreadyExistsError`

## Branch-Scoped Authorization Pattern

Services validate ownership chain before mutations:
```
User → Organization (ownerId) → Restaurant (organizationId) → Branch (restaurantId)
```

Example: `assertRestaurantOwnership(userId, restaurantId)` loads restaurant → loads org → checks `org.ownerId === userId`.

## Key Implications for Device Sessions

1. **New `/t/{publicId}` route:** Must be public (no auth required). Add to `appRoutes` as public type.

2. **Device session ≠ Supabase session:** Device sessions are anonymous. They exist alongside (not replace) Supabase auth.

3. **`order.create` must change procedure type:** Currently `protectedProcedure` (requires Supabase auth). Must become `publicProcedure` with custom device session validation middleware or inline check.

4. **Context extension:** Add optional `deviceSessionId` to tRPC context. Could be extracted from cookie or request header.

5. **No new procedure type needed:** Device session validation can be done in the service layer (not middleware) since it's specific to order creation. The service checks `deviceSessionId` → `tableSession.status === 'active'`.

6. **Table management stays `protectedProcedure`:** Only authenticated owners manage tables/sessions.

7. **Proxy doesn't need changes:** `/t/{publicId}` is a public route — proxy passes through.
