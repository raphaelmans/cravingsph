# CravingsPH — Implementation Intent

## What We're Building

A mobile-first restaurant menu and ordering platform for the Philippines. Customers browse menus via QR code or direct link, customize items, build carts, and place orders. Restaurant owners manage their menus and incoming orders through an admin dashboard.

## Source of Truth

| Concern | Source |
| --- | --- |
| Product features & UX | Figma (`Cravings-PH` file) |
| Brand identity | Figma + legacy codebase (`#f86006` orange, pill shapes, Inter font) |
| Architecture & conventions | `guides/` directory (generated from `node-architecture` repo) |
| Feature gaps & priorities | `docs/legacy-analysis/` |

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | SSR, RSC, file-based routing |
| Language | TypeScript 5 | End-to-end type safety |
| UI | shadcn/ui (New York) + Tailwind CSS 4 | Composable, themeable, accessible |
| API | tRPC 11 | Type-safe RPC, no codegen, shared types |
| Database | PostgreSQL via Supabase | Managed Postgres, auth, storage, realtime |
| ORM | Drizzle | Type-safe queries, migration support |
| Auth | Supabase Auth (SSR) | Email/password, magic link, Google OAuth |
| Server State | TanStack React Query 5 | Cache, dedup, background refresh |
| Client State | Zustand (when needed) | Lightweight, no boilerplate |
| Validation | Zod | Shared schemas across client/server |
| Logging | Pino | Structured, fast, JSON |
| Linting | Biome | Replaces ESLint + Prettier, faster |

## Architecture

Follows `guides/server/core/overview.md` — layered architecture with explicit boundaries:

```
tRPC Router → Use Case → Service → Repository → Database
```

- **Manual DI** via factory functions (no DI container magic)
- **Transaction manager** for ACID operations across services
- **Domain errors** mapped to tRPC error codes
- **Modules** under `src/modules/` — each with router, service, repository, DTOs, errors

Client follows `guides/client/core/overview.md`:

```
Route → Feature Component → hooks.ts → api.ts → tRPC client
```

- **Feature modules** under `src/features/`
- **Server state** stays in TanStack Query cache, not Zustand
- **Zustand** only for client-coordination state (cart, UI toggles)

## What Carries Over from Legacy

| Pattern | Status |
| --- | --- |
| Branch-based URLs (`/restaurant/[slug]`) | Keep |
| Category-based menu organization | Keep |
| Modifier system (required/optional, min/max, priced add-ons) | Keep — schema to be recreated with UUIDs |
| Cart with smart item merging | Keep — Zustand store pattern |
| Persistent local cart (localStorage) | Keep |
| Philippine address model (province → city → barangay) | Keep |
| Brand color `#f86006` | Keep |
| Pill-shaped UI for customer-facing pages | Keep |
| Inter as body font | Keep |

## What's New (Not in Legacy)

| Capability | Approach |
| --- | --- |
| Authentication | Supabase Auth (email, magic link, Google OAuth) — already built |
| API layer | tRPC — replaces server-component-only data fetching |
| Admin dashboard | Desktop layout, sidebar nav — per Figma |
| Bill splitting | Multi-step flow — per Figma |
| Restaurant discovery | Home feed with search/categories — per Figma |
| Ordering & checkout | To be designed — not in Figma yet |
| Payments | To be designed — not in Figma yet |
| Dark mode | next-themes with system preference |
| Structured logging | Pino (legacy had none) |
| Error handling | AppError hierarchy with HTTP mapping |

## Key Conventions

- **UUIDs** for all primary keys (legacy used serial integers)
- **`timestamptz`** for all timestamps (legacy used `timestamp` without timezone)
- **Drizzle migrations** (not `db:push`) once domain schema is added
- **No barrel exports** — import directly from source files
- **Tests** in `src/__tests__/` mirroring source tree (not colocated)
- **Feature APIs** use `I<Feature>Api` interface + class + factory for testability
- **Domain errors** extend `AppError` base class per module

## Environments

| Env | Purpose |
| --- | --- |
| Local | `pnpm dev` + local Supabase (or remote dev project) |
| Preview | Vercel preview deployments (per PR) |
| Production | Vercel + Supabase production project |

## Design Conventions

- **Prices**: Always use `<Price />` from `@/components/brand/price` — renders in orange (`text-primary`) with `tabular-nums` for aligned columns
- **Shapes**: Customer-facing pages use `shape="pill"` on buttons and inputs; admin pages use the default `rounded-md`
- **Containers**: Cards and images use `rounded-lg` / `rounded-xl` — never pill-shaped
- **Logo**: Use `<Logo />` from `@/components/brand/logo` — available in `sm`, `default`, `lg`, `xl` sizes
- **Peach backgrounds**: Use `bg-peach` / `text-peach-foreground` for warm hero sections and empty states; keep `bg-accent` for component hover states

## References

- Legacy analysis: `docs/legacy-analysis/`
- Figma: `Cravings-PH` (fileKey: `cBJhwBIWN5aTPWd3thXuLT`)
- Architecture guides: `guides/` (do not edit — synced from `node-architecture` repo)
- PRD: `docs/prd.md` (empty — to be written)
