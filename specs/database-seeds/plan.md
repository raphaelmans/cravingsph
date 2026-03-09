# Implementation Plan

## Checklist

- [ ] Step 1: Add seed script plumbing and package commands
- [ ] Step 2: Implement environment and owner prerequisite validation
- [ ] Step 3: Seed supporting owner records and top-level business entities
- [ ] Step 4: Seed the menu hierarchy
- [ ] Step 5: Add idempotency tracking and summary output
- [ ] Step 6: Add tests and fixture validation
- [ ] Step 7: Run and verify the seed locally

## Step 1: Add seed script plumbing and package commands

Objective:
Create the basic script entrypoint and package script wiring so the repo has a standard place to run database seeds.

Implementation guidance:
Add a `scripts/` directory if needed, create `scripts/seed-demo-restaurant.ts`, add a fixture module under `scripts/seed-data/`, and wire `package.json` scripts using `dotenvx run --env-file=.env.local -- tsx ...`.

Test requirements:
Verify the package script resolves the file path and starts execution without TypeScript import errors.

Integration notes:
Keep the seed script independent of the app runtime; connect to Drizzle directly like the reference repo.

Demo description:
Running `pnpm db:seed:demo` reaches the script entrypoint and prints a startup message.

## Step 2: Implement environment and owner prerequisite validation

Objective:
Prevent partial or misleading seed runs by validating required configuration and auth prerequisites first.

Implementation guidance:
Require `DATABASE_URL` and `SEED_OWNER_USER_ID`. Query `auth.users` to ensure the owner exists before any app-table inserts begin.

Test requirements:
Manually test the three failure cases: missing `DATABASE_URL`, missing `SEED_OWNER_USER_ID`, and unknown owner user ID.

Integration notes:
This step should fail before any write to `organization`, `restaurant`, or downstream tables.

Demo description:
Invalid configuration exits early with a clear error message and no app data written.

## Step 3: Seed supporting owner records and top-level business entities

Objective:
Create the minimum owner-linked graph needed to support restaurant data.

Implementation guidance:
Upsert `profile` and `user_roles` for the owner if they are missing, then create or reuse the target `organization`, `restaurant`, and `branch` using stable lookup keys.

Test requirements:
Run against an empty local DB with a valid owner and confirm one organization tree is created.

Integration notes:
Use deterministic slugs in fixture data so reruns locate the same records.

Demo description:
The owner now has a complete top-level restaurant tree visible in the database.

## Step 4: Seed the menu hierarchy

Objective:
Populate the demo branch with categories, menu items, variants, and modifiers that exercise real UI behavior.

Implementation guidance:
Insert categories in sort order, then items under each category, then optional variants and modifier groups with nested modifiers. Use code-level lookup rules to avoid duplicate children on rerun.

Test requirements:
Verify at least one item has variants, at least one item has a required modifier group, and at least one item has optional add-ons.

Integration notes:
Keep fixture data in a dedicated module so future menus can be added without rewriting control flow.

Demo description:
The branch menu is rich enough to test browse, customize, and cart flows.

## Step 5: Add idempotency tracking and summary output

Objective:
Make repeated seed runs safe and operator-friendly.

Implementation guidance:
Track created and skipped counts per entity type and print a compact summary at the end. Use stable lookup keys before every insert.

Test requirements:
Run the seed twice and confirm the second run reports mostly skips and creates no duplicates.

Integration notes:
This step is essential because the schema does not enforce uniqueness on most child rows.

Demo description:
The second seed run completes successfully and reports an idempotent result.

## Step 6: Add tests and fixture validation

Objective:
Reduce regression risk as fixture content evolves.

Implementation guidance:
Add targeted tests for helper functions or fixture invariants rather than trying to fully integration-test the script runner inside unit tests.

Test requirements:
Cover any helper that derives lookup keys or traverses nested seed fixtures. Validate critical fixture assumptions such as unique category names within a branch and unique item names within a category.

Integration notes:
Keep tests lightweight so the seed workflow remains easy to maintain.

Demo description:
Fixture and helper regressions are caught before the seed is run manually.

## Step 7: Run and verify the seed locally

Objective:
Execute the finished seed workflow and confirm it supports the intended local product flows.

Implementation guidance:
Run migrations if needed, execute `pnpm db:seed:demo`, then verify the owner portal and public menu routes against the seeded data.

Test requirements:
Manual verification should include:
- owner restaurant list,
- branch management,
- public menu category rendering,
- item variant and modifier visibility.

Integration notes:
Document the required env vars and any prerequisite owner-account creation step in the repo README or a local setup note if needed.

Demo description:
A developer can start from a migrated local database, run one seed command, and immediately browse a realistic CravingsPH menu.
