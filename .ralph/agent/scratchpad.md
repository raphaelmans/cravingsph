# Database Seeds - Scratchpad

## Understanding

The objective is to implement a `pnpm db:seed:demo` command that creates one realistic Filipino restaurant/menu hierarchy. The spec is well-defined in `specs/database-seeds/`.

Key schema chain: `auth.users -> profile/user_roles -> organization -> restaurant -> branch -> category -> menu_item -> item_variant/modifier_group -> modifier`

The repo already has `dotenvx` and `tsx` in devDependencies. Just needs the script files + package.json script entry.

## Plan

Since these are all new files (no existing code to modify except package.json), the core implementation is one cohesive deliverable:

1. **Task 1: Core seed implementation** - Create `scripts/seed-demo-restaurant.ts` (runner), `scripts/seed-data/demo-restaurant.ts` (fixture data), and wire `package.json`. This covers env validation, auth check, idempotent upserts, and summary output.
2. **Task 2: Typecheck/lint validation** - Run biome check and tsc to verify everything compiles.
3. **Task 3: Local verification** - Run the seed against a real local DB and verify it works.

Starting with Task 1 since it's the bulk of the work.

## Iteration 1 - Complete

Implemented the full seed script:
- `scripts/seed-data/demo-restaurant.ts` — fixture data (Filipino restaurant "Kusina ni Aling Rosa" with 6 categories, 20 items, variants, modifiers)
- `scripts/seed-demo-restaurant.ts` — runner with env validation, auth.users check, idempotent upserts, summary output
- `package.json` — wired `db:seed:demo` command

Typecheck and biome both pass. Committed as 3b46529.

Remaining: task-1773072667-1d17 (typecheck/lint verification) is already satisfied by this iteration's verification. Need to close it next iteration and potentially do local DB verification.
