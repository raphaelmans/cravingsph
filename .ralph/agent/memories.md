# Memories

## Patterns

### mem-1773070457-499a
> Pattern: use shared feedback primitives plus route-group loading.tsx and error.tsx files for cross-cutting polish, while page-specific loading files stay only where a route needs a more tailored skeleton than the generic public/auth/dashboard fallback.
<!-- tags: nextjs, frontend, error-handling | created: 2026-03-09 -->

### mem-1773070074-d8fd
> Customer account now uses real profile.me/profile.update plus auth.logout instead of a local scaffold, with a dedicated customer-account feature module and pill-styled form to match the protected customer retention pages.
<!-- tags: customer-account, profile, auth, frontend | created: 2026-03-09 -->

### mem-1773069826-e8ea
> Customer saved restaurants use a local localStorage-backed useSyncExternalStore scaffold with seeded restaurant metadata, so save/unsave persists across reloads before savedRestaurant.toggle or public restaurant-list procedures exist.
<!-- tags: customer-retention, saved-restaurants, frontend | created: 2026-03-09 -->

### mem-1773069499-a30e
> Customer retention order history uses a local useSyncExternalStore customer-orders store plus the persisted cart store for reorder; review submissions and restaurant review display stay interactive before order/review procedures exist, and reorder replaces an existing cart when switching restaurant while skipping unavailable items.
<!-- tags: customer-retention, orders, frontend | created: 2026-03-09 -->

### mem-1773069036-8345
> Admin user management reads real auth.users + profile + user_roles data through admin.getUsers, while deactivate/reactivate stays in a useSyncExternalStore scaffold until a persisted user suspension field or Supabase admin integration exists.
<!-- tags: admin, user-management, trpc | created: 2026-03-09 -->

### mem-1773068666-095f
> Admin restaurant management uses admin-only tRPC procedures that read and update the restaurant table directly, because owner restaurant mutations still enforce organization ownership. The admin list filters client-side over real restaurant/org/profile data, and the detail page persists featured/active toggles through admin.updateRestaurant.
<!-- tags: admin, restaurant-management, trpc | created: 2026-03-09 -->

### mem-1773068171-eaf2
> Admin verification queue/review uses real admin tRPC procedures plus restaurant.verificationStatus persistence, while treating restaurant.id as requestId and seeding document metadata from the owner verification requirements until a dedicated verification-request/documents schema exists.
<!-- tags: admin, verification, trpc | created: 2026-03-09 -->

### mem-1773067724-3536
> pattern: admin dashboard now uses adminProcedure plus a dedicated admin router to return real restaurant, pending verification, and user-role counts, while keeping ordersToday explicitly unavailable until order schema and procedures exist
<!-- tags: admin, frontend, trpc | created: 2026-03-09 -->

### mem-1773067271-0309
> Next.js App Router static pages that read useSearchParams() at the route root must move the hook into a child client component wrapped by Suspense; mirroring the owner onboarding pattern fixed /search prerender.
<!-- tags: nextjs, search, build | created: 2026-03-09 -->

### mem-1773066715-93a9
> Owner verification scaffolds status from restaurant.verificationStatus and layers per-restaurant document/contact drafts in a shared useSyncExternalStore so uploads and resubmissions stay interactive before backend verification endpoints exist.
<!-- tags: verification, owner-portal, frontend | created: 2026-03-09 -->

### mem-1773066364-3e66
> Owner branch settings persist branch order toggles and payment countdown through branch.update, while weekly operating hours stay in a per-branch useSyncExternalStore scaffold until scheduling fields exist.
<!-- tags: branch-settings, owner-portal, frontend | created: 2026-03-09 -->

### mem-1773066031-1c80
> Owner payment config uses a local useSyncExternalStore store so add/edit/remove/default actions stay interactive before payment tRPC procedures or schema fields exist.
<!-- tags: payment-config, frontend, owner-portal | created: 2026-03-09 -->

### mem-1773065680-199e
> Owner order-management hooks use a shared useSyncExternalStore mock store so orders, detail pages, payment review, and timeline actions stay interactive before order tRPC procedures exist.
<!-- tags: order-management, frontend, testing | created: 2026-03-09 -->

### mem-1773054454-fa90
> Biome linter is used (not ESLint/next lint). Run 'npx biome check' for linting, 'npx biome check --write' for auto-fix. Biome enforces import sorting and disallows array index keys.
<!-- tags: linting, tooling | created: 2026-03-09 -->

### mem-1773054450-a380
> Restaurant service getBySlug throws RestaurantNotFoundError (extends NotFoundError) — does NOT return null. Server caller propagates raw domain errors, not TRPCError. Catch NotFoundError and call notFound() in RSC pages.
<!-- tags: restaurant, trpc, error-handling | created: 2026-03-09 -->

## Decisions

## Fixes

### mem-1773070527-47fd
> LOOP_COMPLETE should be sent with 'ralph emit' and a brief payload; the earlier malformed completion came from invalid event JSON rather than unfinished work.
<!-- tags: tooling, error-handling | created: 2026-03-09 -->

### mem-1773070216-6eb8
> failure: cmd=tail -n 40 .ralph/agent/decisions.md, exit=1, error=file does not exist in this repo state, next=check for the file before reading decisions and only create/update it when a sub-80 confidence decision actually needs documenting
<!-- tags: tooling, error-handling | created: 2026-03-09 -->

### mem-1773070216-6eb9
> failure: cmd=sed -n '1,260p' src/app/(public)/restaurant/[slug]/page.tsx, exit=1, error=zsh no matches found because App Router paths with [] and () were unquoted, next=quote the full path like src/app/'(public)'/restaurant/'[slug]'/page.tsx when using zsh
<!-- tags: tooling, error-handling, zsh | created: 2026-03-09 -->

### mem-1773069826-e907
> failure: cmd=npx tsc --noEmit after adding src/app/(public)/saved/page.tsx, exit=2, error=.next/types/validator.ts reported '/saved' does not satisfy AppRoutes, next=run 'npx next typegen' to refresh generated Next route types before rerunning typecheck because tsconfig includes both .next/types and .next/dev/types
<!-- tags: nextjs, typed-routes, error-handling | created: 2026-03-09 -->

### mem-1773069602-2eab
> failure: cmd=rg -n "authRouter|me: .*publicProcedure|me: .*protectedProcedure|type Session|session\.role|userId" src/modules/auth src/shared/infra/trpc src/shared/infra/auth, exit=2, error=src/shared/infra/auth does not exist in this repo, next=search auth/session code under src/modules/auth plus src/shared/infra/trpc instead of assuming a src/shared/infra/auth directory
<!-- tags: tooling, auth, error-handling | created: 2026-03-09 -->

### mem-1773069230-b36a
> failure: cmd=sed -n '1,220p' /Users/raphaelm/.config/skillshare/skills/ralph-tools/SKILL.md, exit=1, error=No such file or directory, next=use the auto-injected Ralph Tools skill block or load it via 'ralph tools skill load ralph-tools' instead of assuming a Skillshare path
<!-- tags: tooling, skills, error-handling | created: 2026-03-09 -->

### mem-1773069036-8345
> failure: cmd=sed -n '1,260p' src/app/(owner)/organization/team/page.tsx plus guessed src/features/team-management/* paths, exit=1, error=No such file or directory, next=use rg --files on src/app and src/features before assuming owner team-management paths because that feature layer is not present in this repo yet
<!-- tags: tooling, error-handling, rg | created: 2026-03-09 -->

### mem-1773067840-157a
> failure: cmd=sed -n '1,240p' src/shared/infra/db/schema/user-role.ts, exit=1, error=No such file or directory, next=use the barrel or actual schema filename from src/shared/infra/db/schema/index.ts when looking up user role tables
<!-- tags: tooling, db-schema, error-handling | created: 2026-03-09 -->

### mem-1773067724-3537
> failure: cmd=rg -n with complex alternation and escaped backticks under zsh, exit=1, error=zsh unmatched quote, next=split complex ripgrep patterns into simpler commands instead of mixing escaped quotes and backticks in one search
<!-- tags: tooling, rg, error-handling | created: 2026-03-09 -->

### mem-1773067724-b943
> failure: cmd=sed -n "1,240p" src/trpc/client.tsx, exit=1, error=No such file or directory, next=the tRPC client entry in this repo is src/trpc/client.ts rather than .tsx
<!-- tags: tooling, trpc, error-handling | created: 2026-03-09 -->

### mem-1773067136-fb20
> failure: cmd=npm run build, exit=1, error=useSearchParams() should be wrapped in a suspense boundary at page "/search" during prerender, next=wrap the search page client hook usage in Suspense or move useSearchParams behind a client boundary before relying on production build
<!-- tags: build, nextjs, search, error-handling | created: 2026-03-09 -->

### mem-1773065779-fa46
> failure: cmd=sed -n '1,220p' src/app/(owner)/sidebar.tsx, exit=1, error=zsh:1: no matches found: src/app/(owner)/sidebar.tsx, next=quote or escape App Router paths containing parentheses when running shell commands under zsh
<!-- tags: tooling, error-handling, zsh | created: 2026-03-09 -->

### mem-1773065481-0a0d
> failure: cmd=python - <<'PY' ..., exit=127, error=zsh:1: command not found: python, next=use python3 for inline scripts in this repo environment
<!-- tags: tooling, error-handling | created: 2026-03-09 -->

## Context
