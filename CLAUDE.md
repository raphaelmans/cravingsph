# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
| Unit tests (watch) | `pnpm test:unit:watch` |
| Single unit test | `npx vitest run src/__tests__/path/to/file.test.ts` |
| E2E tests | `pnpm test:e2e` |
| E2E tests (UI) | `pnpm test:e2e:ui` |
| DB migrations | `pnpm db:generate && pnpm db:migrate` |
| DB push (dev) | `pnpm db:push` |
| DB studio | `pnpm db:studio` |
| Seed demo data | `pnpm db:seed:all` |
| Type check | `npx tsc --noEmit` |

## Architecture

### Layered Backend (DDD-inspired)

```
tRPC Router (controller) → Service (domain logic) → Repository (data access) → Drizzle/DB
```

Each module in `src/modules/{module}/` follows this structure:
- `{module}.router.ts` — tRPC procedures (input validation, calls service)
- `services/{module}.service.ts` — stateless business logic, accepts optional transaction context
- `repositories/{module}.repository.ts` — data access, returns DB records
- `dtos/{module}.dto.ts` — Zod schemas for input validation
- `errors/{module}.errors.ts` — custom error classes extending `AppError`
- `factories/{module}.factory.ts` — DI wiring (lazy singletons for repos/services)

**Key rules:**
- Services MUST NOT call other services directly (no cross-service coupling)
- Multi-service orchestration goes in `use-cases/`
- Repositories return raw DB records, not DTOs
- All wiring through factory functions, never direct instantiation in routers

### tRPC

- Root router: `src/shared/infra/trpc/root.ts`
- Three procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure`
- Server caller for RSCs: `src/trpc/server.ts` — use `const caller = await api()`
- Client hooks: `src/trpc/client.ts` — use `useTRPC()` with tanstack-query

### Route Groups & Auth

Route-based access control via `src/proxy.ts` (Next.js middleware):
- `(public)` — `/`, `/restaurant/[slug]`, `/search` — no auth required
- `(auth)` — `/login`, `/register`, `/magic-link` — guest-only (redirects if logged in)
- `(customer)` — `/orders`, `/saved`, `/account` — requires auth
- `(owner)` — `/organization/**` — requires auth + organization membership
- `(admin)` — `/admin/**` — requires admin role

Route definitions: `src/common/app-routes.ts`

### Frontend Features

Features live in `src/features/{feature}/` with:
- `components/` — React components (client or server)
- `hooks/` — custom hooks (data fetching, local state)
- `stores/` — Zustand stores (if needed)

### State Management

- **Server state**: TanStack Query via tRPC hooks
- **Client state**: Zustand v5 with `persist` middleware for cart
- **Important**: When selecting multiple values from a Zustand store, use `useShallow` from `zustand/shallow` to prevent infinite re-render loops from unstable object references

### Database

- Drizzle ORM with PostgreSQL (Supabase-hosted)
- Schema: `src/shared/infra/db/schema/`
- Migrations: `drizzle/` directory
- Transaction manager: `src/shared/kernel/transaction.ts`

### Error Handling

Base class hierarchy in `src/shared/kernel/errors.ts`:
- `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403)
- `NotFoundError` (404), `ConflictError` (409), `BusinessRuleError` (422)
- tRPC error formatter auto-maps `AppError` subclasses to structured responses

### Design System

Canonical reference: `docs/design-system.md`

- shadcn/ui `new-york` style with Radix primitives
- Icons: lucide-react exclusively
- Colors: OKLCH tokens in `src/app/globals.css` — never use hardcoded Tailwind color classes (red-500, green-600, etc.)
- Semantic tokens: `primary`, `destructive`, `success`, `warning`, `muted`, `accent`, `peach`
- **Note**: The design system doc defines `--accent` as orange (same as primary), but in the codebase `--accent` is a neutral gray because shadcn/ui uses `accent` for component hover states (dropdowns, menus, cards). Orange hover backgrounds break usability. The codebase value is correct.
- Brand primary: `#f86006` (warm orange) — the only hex color in the system
- Border radius: use token scale (`rounded-sm` through `rounded-4xl`), never raw pixel values
- Fonts: Inter (sans), Plus Jakarta Sans (headings), Geist Mono (mono)
- Customer portal uses pill shapes (`rounded-full` for buttons/badges, `rounded-4xl` for large cards)

### Logging

Pino with structured logging. Request correlation via `requestId`. Redaction of sensitive fields. Pretty-print in dev, JSON in production. `src/shared/infra/logger/`

## Architecture Guides

This project uses architecture guides from `guides/`. They are maintained externally and copied via `copy-guides.sh`. **Do not edit files inside `guides/` directly.**

### Behavior Rules

- **No automatic refactoring.** If existing code does not follow a guide, note the deviation and continue. Do NOT refactor code outside the current task scope unless explicitly asked.
- **Core is mandatory for new and modified files.** Any file you create or modify must comply with the core standards.
- **Framework guides are additive.** They layer on top of core; they do not replace it.
- **Ignore guides that do not apply.** Do not import new libraries or suggest patterns from irrelevant guides.

### Mandatory — Client Core

Read and follow for any client-side work:
- `guides/client/core/overview.md`
- `guides/client/core/architecture.md`
- `guides/client/core/conventions.md`
- `guides/client/core/folder-structure.md`
- `guides/client/core/client-api-architecture.md`
- `guides/client/core/domain-logic.md`
- `guides/client/core/error-handling.md`
- `guides/client/core/validation-zod.md`
- `guides/client/core/server-state-tanstack-query.md`
- `guides/client/core/query-keys.md`
- `guides/client/core/state-management.md`
- `guides/client/core/logging.md`
- `guides/client/core/testing.md`

### Mandatory — Server Core

Read and follow for any server-side work:
- `guides/server/core/overview.md`
- `guides/server/core/conventions.md`
- `guides/server/core/api-contracts-zod-first.md`
- `guides/server/core/api-response.md`
- `guides/server/core/error-handling.md`
- `guides/server/core/endpoint-naming.md`
- `guides/server/core/id-generation.md`
- `guides/server/core/transaction.md`
- `guides/server/core/logging.md`
- `guides/server/core/rate-limiting.md`
- `guides/server/core/testing-service-layer.md`

### Framework Guides — React

- `guides/client/frameworks/reactjs/overview.md`
- `guides/client/frameworks/reactjs/conventions.md`
- `guides/client/frameworks/reactjs/composition-react.md`
- `guides/client/frameworks/reactjs/error-handling.md`
- `guides/client/frameworks/reactjs/server-state-patterns-react.md`
- `guides/client/frameworks/reactjs/forms-react-hook-form.md`
- `guides/client/frameworks/reactjs/state-zustand.md`
- `guides/client/frameworks/reactjs/ui-shadcn-radix.md`

### Framework Guides — Next.js Client

- `guides/client/frameworks/reactjs/metaframeworks/nextjs/overview.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/folder-structure.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/routing-ssr-params.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/environment.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/testing-vitest.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/trpc.md`
- `guides/client/frameworks/reactjs/metaframeworks/nextjs/query-keys.md`

### Framework Guides — Next.js Server

- `guides/server/runtime/nodejs/metaframeworks/nextjs/route-handlers.md`
- `guides/server/runtime/nodejs/metaframeworks/nextjs/caching-revalidation.md`
- `guides/server/runtime/nodejs/metaframeworks/nextjs/next-config-security.md`
- `guides/server/runtime/nodejs/metaframeworks/nextjs/metadata-seo.md`

### Framework Guides — tRPC

- `guides/server/runtime/nodejs/libraries/trpc/integration.md`
- `guides/server/runtime/nodejs/libraries/trpc/authentication.md`
- `guides/server/runtime/nodejs/libraries/trpc/rate-limiting.md`

### Framework Guides — Supabase

- `guides/server/runtime/nodejs/libraries/supabase/integration.md`
- `guides/server/runtime/nodejs/libraries/supabase/auth.md`

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
| DB connection | `src/shared/infra/db/index.ts` |
| DB schema | `src/shared/infra/db/schema/` |
| Error classes | `src/shared/kernel/errors.ts` |
| Route definitions | `src/common/app-routes.ts` |
| DI container | `src/shared/infra/container.ts` |
| Design tokens | `src/app/globals.css` |
| Env validation | `src/lib/env/` |
| Design system doc | `docs/design-system.md` |

## Design Context

### Users

**Customers** — Mobile-first users discovering restaurants and ordering food in the Philippines. They're browsing on-the-go, often hungry, and need to find what they want fast. The job: scan, pick, order, done.

**Restaurant owners** — Non-technical business operators managing menus, branches, and orders. They need speed of editing and clarity of structure, not technical complexity. The job: keep the menu accurate and orders flowing.

### Brand Personality

**Warm, Effortless, Appetizing.** Cravings Orange (`#f86006`) represents appetite, energy, and warmth. The brand feels friendly and modern — never corporate, never cluttered, never over-designed. Food and restaurant content take center stage; the UI gets out of the way.

### Aesthetic Direction

**Apple-style minimal.** Clean, light, refined. Generous white space reduces cognitive load. Content-forward — food images, restaurant info, and prices are the visual focus, not the chrome around them.

- **Customer portal**: Pill shapes (`rounded-full` buttons, `rounded-4xl` cards), peach accents for hero/celebratory moments, emoji cuisine filters, floating cart — playful and discovery-driven
- **Owner portal**: Like Notion/Linear/Stripe — structured, efficient, scannable. Standard `rounded-lg`, data-dense cards, inline editing, live previews. Professional but still warm (not cold SaaS)
- **Theme**: Light + dark mode, OKLCH tokens throughout, never hardcoded Tailwind color classes
- **Anti-references**: GrabFood/FoodPanda (cluttered, promo-heavy), generic SaaS dashboards (cold, no personality), over-designed apps (animation over usability)

### Motion

Subtle, purposeful, fast. Animations complete in 150-250ms with ease-out curves. Motion communicates state changes (hover, selection, loading) — never decorative. Skeleton loaders for async content. Slight scale (1.02-1.04) on button hover, gentle elevation on card hover.

**Animation tools:** Tailwind CSS animations (`tw-animate-css`) and raw CSS only. No heavy animation libraries (Framer Motion, GSAP, etc.) — they bloat the bundle and hurt SEO/performance.

### Design Principles

1. **Content is king** — Food images, names, and prices are the hero. UI chrome should be invisible. Reduce decoration; increase clarity.
2. **Scan, don't read** — Users should understand key information instantly. Strong hierarchy, consistent spacing (8px grid), and clear typography enable quick scanning.
3. **Mobile-first, always** — Design for small screens first. Pill shapes and large touch targets on customer-facing UI. Layouts expand for desktop, not the reverse.
4. **Two tones, one brand** — Customer portal is warm and playful; owner portal is structured and efficient. Both share the orange brand color, the same font stack, and the same spacing system. The warmth carries through even in the admin side.
5. **Feedback, not flash** — Every interaction gets immediate, lightweight feedback (press, hover, loading). No gratuitous animation. `prefers-reduced-motion` is respected.

### Accessibility

- Target: **WCAG 2.1 AA**
- Touch targets: 44x44px minimum on mobile
- Focus rings on all interactive elements (using `--ring` token)
- `prefers-reduced-motion: reduce` disables all animations
- Semantic HTML and ARIA attributes for screen readers
- Color is never the sole indicator of state (always paired with icons, text, or patterns)
