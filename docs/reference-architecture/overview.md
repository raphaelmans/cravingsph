# Reference Architecture — next16bp (KudosCourts)

> Source: `/Users/raphaelm/Documents/Coding/boilerplates/next16bp`
>
> CravingsPH follows the same architecture. This document captures the patterns, conventions, and key files from the boilerplate so we can replicate them exactly.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.1.0 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| API layer | tRPC | ^11.8.1 |
| Data fetching | TanStack Query | ^5.90 |
| ORM | Drizzle ORM | ^0.45.1 |
| Database driver | postgres.js | ^3.4.7 |
| Auth | Supabase Auth (`@supabase/ssr`) | 0.8.0 |
| CSS | Tailwind v4 + PostCSS | ^4 |
| UI components | shadcn/ui (Radix primitives) | various |
| State (client) | Zustand + XState | ^5 / ^5.28 |
| Forms | react-hook-form + Zod | ^7.70 / ^4.3 |
| URL state | nuqs | ^2.8.6 |
| Rate limiting | Upstash Ratelimit + Redis | ^2.0.7 |
| Logging | pino + pino-pretty | ^10.1.0 |
| Email | Resend | ^6.8.0 |
| Lint/format | Biome | 2.2.0 |
| Unit tests | Vitest + jsdom | ^4.0.18 |
| E2E tests | Playwright | ^1.58 |
| Env validation | @t3-oss/env-nextjs | ^0.13 |

---

## Project Structure

```
src/
├── app/                         # Next.js App Router (routing ONLY)
│   ├── (admin)/                 # Admin route group
│   ├── (auth)/                  # Authenticated route group
│   ├── (owner)/                 # Owner/org route group
│   ├── (protected)/             # Generic protected route group
│   ├── (public)/                # Public-facing route group
│   ├── api/trpc/[trpc]/route.ts # Single tRPC HTTP endpoint
│   ├── globals.css              # Tailwind v4 + design tokens
│   └── layout.tsx               # Root layout
├── common/                      # Cross-feature shared utilities (client-safe)
│   ├── app-routes.ts            # Typed route registry + classification
│   ├── errors/                  # Client-side error types + tRPC adapters
│   ├── feature-api-hooks.ts     # useFeatureQuery / useFeatureMutation
│   ├── providers/               # Root Providers (QueryClient + tRPC + Nuqs)
│   ├── toast/                   # Toast adapter (wraps sonner)
│   └── trpc-client-call.ts      # callTrpcQuery / callTrpcMutation helpers
├── components/                  # Shared UI components
│   ├── ui/                      # shadcn/ui primitives
│   ├── form/                    # StandardForm wrappers (RHF + shadcn)
│   ├── layout/                  # Dashboard shell, navbar, sidebar
│   └── brand/                   # Brand-specific (logo, etc.)
├── features/                    # Feature modules (vertical slices)
│   └── <feature>/
│       ├── api.ts               # Feature API class (typed tRPC wrappers)
│       ├── hooks.ts             # useQuery*/useMut*/useMod* hooks
│       ├── components/          # Feature UI components
│       └── pages/               # Page-level orchestrators
├── lib/
│   ├── env/index.ts             # @t3-oss/env-nextjs validated env schema
│   ├── modules/                 # Domain modules (server-side only)
│   │   └── <module>/
│   │       ├── <module>.router.ts
│   │       ├── <module>.dto.ts
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── factories/
│   │       └── errors/
│   └── shared/
│       ├── infra/               # Infrastructure
│       │   ├── container.ts     # Composition root (db + transactionManager)
│       │   ├── db/              # Drizzle client, schema, transactions
│       │   ├── trpc/            # tRPC init, root router, context, middleware
│       │   ├── logger/          # pino logger
│       │   ├── ratelimit/       # Upstash rate limiting
│       │   ├── supabase/        # Supabase client factory
│       │   └── auth/            # Server-side session helpers
│       └── kernel/              # Domain primitives
│           ├── errors.ts        # AppError hierarchy
│           ├── auth.ts          # Session, UserRole, ROLE_PERMISSIONS
│           └── transaction.ts   # TransactionManager interface
├── trpc/                        # tRPC client wiring
│   ├── client.ts                # createTRPCReact<AppRouter>()
│   ├── client-api.ts            # Vanilla tRPC client (non-React)
│   ├── links.ts                 # splitLink (batch vs. single)
│   ├── query-client.ts          # SSR-safe QueryClient singleton
│   └── server.ts                # publicCaller + HydrateClient (RSC)
└── __tests__/                   # Tests mirroring src/ structure
```

---

## Layered Architecture

5 layers with **strict enforcement** via `scripts/architecture/check-client-conformance.sh` (CI gate: `pnpm lint:arch`):

```
┌──────────────────────────────────────────────────────┐
│  src/app/         Next.js App Router (routing only)  │
│  page.tsx, layout.tsx, route.ts                      │
│  NO direct imports from @/components/                │
│  NO publicCaller calls                               │
├──────────────────────────────────────────────────────┤
│  src/features/    Feature Modules (vertical slices)  │
│  components/, pages/, hooks.ts, api.ts               │
│  NO server/ subdirectories                           │
│  Hooks follow useQuery*/useMut*/useMod* naming       │
├──────────────────────────────────────────────────────┤
│  src/common/      Cross-feature shared utilities     │
│  feature-api-hooks.ts, app-routes.ts, providers/     │
├──────────────────────────────────────────────────────┤
│  src/lib/modules/ Domain Modules (server-side)       │
│  router.ts, service.ts, repository.ts, factory.ts   │
├──────────────────────────────────────────────────────┤
│  src/lib/shared/  Infrastructure + Kernel            │
│  infra/ (db, trpc, logger, email…)                   │
│  kernel/ (errors, auth, transaction interfaces)      │
└──────────────────────────────────────────────────────┘
```

---

## Dependency Injection

**Manual DI via factory functions.** No DI container library.

Composition root: `src/lib/shared/infra/container.ts`

```typescript
getContainer() → { db, logger, transactionManager }
```

Each domain module has a factory file that wires dependencies:

```typescript
// src/lib/modules/<module>/factories/<module>.factory.ts
let service: SomeService | null = null;

export function makeSomeService(): SomeService {
  if (!service) {
    service = new SomeService(
      makeSomeRepository(),
      getContainer().transactionManager,
    );
  }
  return service;
}
```

Module-level singletons reuse the same instance across requests.

---

## Authentication

1. **Supabase** handles credential validation + session cookies (`@supabase/ssr`)
2. **tRPC context** (`context.ts`) calls `supabase.auth.getUser()`, then fetches app-level role from `user_roles` table
3. **Enriched session** `{ userId, email, role }` placed on context

**tRPC procedure guards:**

| Procedure | Auth | Rate limit |
|---|---|---|
| `publicProcedure` | None | None |
| `protectedProcedure` | Session required | None |
| `adminProcedure` | Admin role required | None |
| `rateLimitedProcedure(tier)` | None | Yes |
| `protectedRateLimitedProcedure(tier)` | Session + rate limit | Yes |

**Route-level:** `app-routes.ts` classifies routes as `public | guest | protected | organization | admin`. Server components use `requireSession()` / `requireAdminSession()`. No Next.js middleware — enforcement is at the page and procedure level.

---

## Database / ORM

- **Driver:** postgres.js (not pg) — global singleton for dev hot reloads
- **ORM:** Drizzle with `snake_case` casing mode
- **Schema:** Each table in its own file under `src/lib/shared/infra/db/schema/`, barrel-exported from `schema/index.ts`

**Schema file pattern:**

```typescript
export const place = pgTable("place", { ... }, (table) => [indexes...]);
export const PlaceSchema = createSelectSchema(place);      // drizzle-zod
export const InsertPlaceSchema = createInsertSchema(place);
export type PlaceRecord = z.infer<typeof PlaceSchema>;
export type InsertPlace = z.infer<typeof InsertPlaceSchema>;
```

- **Repository pattern:** Typed classes receiving `DbClient` via constructor. Raw Drizzle query builders, no ORM "models"
- **Transactions:** `TransactionManager` interface with `DrizzleTransactionManager`, injected into services
- **Migrations:** `drizzle-kit generate` + `drizzle-kit migrate`

---

## API Layer (tRPC)

### HTTP Entry Point

`src/app/api/trpc/[trpc]/route.ts`:
- CSRF protection (Origin header check)
- Anonymous request blocking for server-only procedures
- Structured error logging with `requestId`

### Error Handling

- **Server:** `AppError` hierarchy (10 subtypes) thrown by services → caught by routers → mapped to `TRPCError` with `cause`
- **Formatter:** Known `AppError` → structured `{ message, code, httpStatus, requestId }`. Unknown → generic `INTERNAL_ERROR` (never leaks internals)
- **Client:** `TRPCClientError` normalized to `AppError` via `toAppError()` in Feature API classes

### Router Tree

40+ domain routers in `root.ts`. Admin routes namespaced under `admin.*`:

```
appRouter.place.*
appRouter.court.*
appRouter.reservation.*
appRouter.admin.court.*
...
```

---

## Client Patterns

### Feature API Classes (`features/*/api.ts`)

Typed class implementing `IFeatureApi`. Every method wraps tRPC via `callTrpcQuery` / `callTrpcMutation`, normalizing errors. Decouples hooks from transport.

```typescript
class DiscoveryApi {
  queryPlaceList = async (input) =>
    callTrpcQuery(this.clientApi, ["place", "list"],
      (api) => api.place.list.query, input, this.toAppError);
}
```

### Feature Hooks (`features/*/hooks.ts`)

Thin wrappers around `useFeatureQuery` / `useFeatureMutation`. **Naming enforced:**
- `useQuery*` — read-only
- `useMut*` — mutations
- `useMod*` — compound (reads + writes + effects)

**Rules (machine-checked):**
- No `.invalidate()` in hooks
- No direct `@/trpc/client` imports
- No namespace `.query()` / `.mutation()` calls

### Data Fetching

Two coexisting patterns:

1. **RSC:** `publicCaller` + `HydrateClient` — prefetch on server, hydrate into client QueryClient (public pages, SEO)
2. **Client:** Feature hooks → Feature API → vanilla tRPC client (authenticated/interactive)

### State Management

| State type | Tool |
|---|---|
| Server state | TanStack Query (via tRPC) |
| URL state | nuqs |
| Complex flows | XState |
| Simple global | Zustand |

---

## Conventions

### File Naming

| File type | Pattern |
|---|---|
| Schema | `<table-name>.ts` (kebab-case) |
| Router | `<module>.router.ts` |
| Service | `<module>.service.ts` |
| Repository | `<module>.repository.ts` |
| Factory | `<module>.factory.ts` |
| DTO | `<module>.dto.ts` |
| Errors | `<module>.errors.ts` |
| Feature API | `api.ts` |
| Feature hooks | `hooks.ts` |

### Error Handling Chain

```
Service throws AppError
  → Router catches, wraps in TRPCError(cause: appError)
  → Error formatter: known AppError → { message, code, httpStatus }
  → Client: TRPCClientError → toAppError() → typed AppError
  → Hook: error typed as AppError
  → Component: toast.error(error.message)
```

### Logging

pino — structured JSON in production, pino-pretty in dev. Sensitive fields redacted. Every request gets a child logger with `{ requestId, userId, method, path }`.

### Testing

- Unit tests in `src/__tests__/` mirroring `src/` paths
- Vitest + jsdom, `server-only` shimmed
- E2E with Playwright
- `restoreMocks: true` — no mock leakage

### Exports

- No barrel exports outside module boundaries
- Schema barrel: `schema/index.ts` is the single import point
- Feature hooks exported from `hooks.ts` directly

---

## Key Reference Files

When implementing features in CravingsPH, reference these boilerplate files for the canonical pattern:

| Pattern | Reference file |
|---|---|
| tRPC init + procedures | `src/lib/shared/infra/trpc/trpc.ts` |
| Router tree | `src/lib/shared/infra/trpc/root.ts` |
| Request context | `src/lib/shared/infra/trpc/context.ts` |
| HTTP entry point | `src/app/api/trpc/[trpc]/route.ts` |
| AppError hierarchy | `src/lib/shared/kernel/errors.ts` |
| Composition root | `src/lib/shared/infra/container.ts` |
| DB singleton | `src/lib/shared/infra/db/drizzle.ts` |
| Schema pattern | `src/lib/shared/infra/db/schema/place.ts` |
| Env validation | `src/lib/env/index.ts` |
| Provider tree | `src/common/providers/index.tsx` |
| tRPC React client | `src/trpc/client.ts` |
| RSC hydration | `src/trpc/server.ts` |
| Feature API class | `src/features/discovery/api.ts` |
| Feature hooks | `src/features/reservation/hooks.ts` |
| Service class | `src/lib/modules/place/services/place-discovery.service.ts` |
| Factory function | `src/lib/modules/court-submission/factories/court-submission.factory.ts` |
| Domain router | `src/lib/modules/court-submission/court-submission.router.ts` |
| Rate limit tiers | `src/lib/shared/infra/ratelimit/config.ts` |
| Logger setup | `src/lib/shared/infra/logger/index.ts` |
| Server session | `src/lib/shared/infra/auth/server-session.ts` |
| Roles + permissions | `src/lib/shared/kernel/auth.ts` |
| Design tokens | `src/app/globals.css` |
| Arch lint rules | `scripts/architecture/check-client-conformance.sh` |
| Next.js config | `next.config.ts` |

> All paths are relative to `/Users/raphaelm/Documents/Coding/boilerplates/next16bp/`
