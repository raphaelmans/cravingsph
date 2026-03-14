# AGENTS.md

Instructions for AI agents working on this codebase.

## Project

CravingsPH — mobile-first restaurant menu and ordering platform for the Philippines. Next.js 16 + React 19, tRPC v11, Drizzle ORM, Supabase Auth, shadcn/ui, Tailwind CSS v4.

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` (port 3443) |
| Build | `pnpm build` |
| Lint | `pnpm lint` (biome check) |
| Format | `pnpm format` (biome format --write) |
| Unit tests | `pnpm test:unit` |
| Single unit test | `npx vitest run src/__tests__/path/to/file.test.ts` |
| E2E tests | `pnpm test:e2e` |
| DB migrations | `pnpm db:generate && pnpm db:migrate` |
| DB push (dev) | `pnpm db:push` |
| Type check | `npx tsc --noEmit` |

## Architecture

### Backend (DDD-inspired layers)

```
tRPC Router (controller) → Service (domain logic) → Repository (data access) → Drizzle/DB
```

Modules live in `src/modules/{module}/` with:
- `{module}.router.ts` — tRPC procedures (input validation, calls service)
- `services/{module}.service.ts` — stateless business logic
- `repositories/{module}.repository.ts` — data access, returns DB records
- `dtos/{module}.dto.ts` — Zod schemas for input validation
- `errors/{module}.errors.ts` — custom error classes extending `AppError`
- `factories/{module}.factory.ts` — DI wiring (lazy singletons)

**Rules:**
- Services MUST NOT call other services directly
- Multi-service orchestration goes in `use-cases/`
- Repositories return raw DB records, not DTOs
- All wiring through factory functions

### Frontend

Features live in `src/features/{feature}/` with `components/`, `hooks/`, `stores/`.

- **Server state**: TanStack Query via tRPC hooks (`useTRPC()`)
- **Client state**: Zustand v5 (use `useShallow` for multi-value selectors)
- **Server caller**: `const caller = await api()` from `src/trpc/server.ts`

### Route Groups

Route-based access control via `src/proxy.ts`:
- `(public)` — no auth required
- `(auth)` — guest-only
- `(customer)` — requires auth
- `(owner)` — requires auth + organization membership
- `(admin)` — requires admin role

## Design System

Canonical reference: `docs/design-system.md`

- shadcn/ui `new-york` style with Radix primitives
- Icons: lucide-react exclusively
- Colors: OKLCH tokens in `src/app/globals.css` — **never use hardcoded Tailwind color classes** (no `red-500`, `green-600`, etc.)
- Semantic tokens: `primary`, `destructive`, `success`, `warning`, `muted`, `accent`, `peach`
- `--accent` is a neutral gray (not orange) — shadcn/ui uses it for hover states
- Brand primary: `#f86006` (warm orange)
- Border radius: use token scale (`rounded-sm` through `rounded-4xl`), never raw pixel values
- Fonts: Inter (sans), Plus Jakarta Sans (headings), Geist Mono (mono)
- All portals use one shared visual system: the same heading treatment, surface hierarchy, empty-state patterns, and motion rules
- Navigation shells may differ by context, but customer, owner, admin, and guides should not drift into separate visual dialects

## Error Handling

Base classes in `src/shared/kernel/errors.ts`:
- `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403)
- `NotFoundError` (404), `ConflictError` (409), `BusinessRuleError` (422)
- tRPC error formatter auto-maps `AppError` subclasses

## Key Conventions

- **No automatic refactoring** — don't refactor code outside current task scope
- Architecture guides in `guides/` are read-only (maintained externally)
- New/modified files must comply with core standards in `guides/`
- Logging: Pino with structured JSON, request correlation via `requestId`
- Anti-references: GrabFood/FoodPanda (cluttered), generic SaaS (cold), over-designed apps

## Key File Paths

| Purpose | Path |
|---|---|
| Root layout | `src/app/layout.tsx` |
| tRPC HTTP handler | `src/app/api/trpc/[trpc]/route.ts` |
| Auth middleware | `src/proxy.ts` |
| Root tRPC router | `src/shared/infra/trpc/root.ts` |
| tRPC config/context | `src/shared/infra/trpc/trpc.ts` |
| Server tRPC caller | `src/trpc/server.ts` |
| Client tRPC hooks | `src/trpc/client.ts` |
| DB schema | `src/shared/infra/db/schema/` |
| Error classes | `src/shared/kernel/errors.ts` |
| Route definitions | `src/common/app-routes.ts` |
| DI container | `src/shared/infra/container.ts` |
| Design tokens | `src/app/globals.css` |
