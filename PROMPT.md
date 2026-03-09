# CravingsPH Database Seeds

## Objective

Implement the database seed workflow described in `specs/database-seeds/` for CravingsPH.

Add a local-development seed command that creates one realistic demo restaurant/menu hierarchy using the current Drizzle schema and the seed style established in the reference boilerplate repo.

## Key Requirements

1. Follow the design and plan in `specs/database-seeds/`.
2. Add a TypeScript seed runner under `scripts/` and keep fixture data separate from runner logic.
3. Wire package scripts using `dotenvx` + `tsx`, similar to the reference repo pattern.
4. Require `DATABASE_URL` and `SEED_OWNER_USER_ID`.
5. Validate that the owner exists in `auth.users` before creating app data.
6. Seed or ensure supporting `profile` and `user_roles` rows for that owner.
7. Seed one demo `organization -> restaurant -> branch -> category -> menu_item -> item_variant / modifier_group -> modifier` graph.
8. Make the seed idempotent and safe to rerun.
9. Print created/skipped counts per entity type.
10. Do not implement destructive reset behavior as part of the default seed command.

## Acceptance Criteria

1. Given `.env.local` contains valid `DATABASE_URL` and `SEED_OWNER_USER_ID`, when `pnpm db:seed:demo` runs on an empty local database, then it creates one demo organization, restaurant, branch, categories, items, variants, modifier groups, and modifiers.
2. Given the owner auth user exists but `profile` and `user_roles` rows do not, when the seed runs, then those supporting rows are created before the organization.
3. Given the seed already ran once, when it runs again with the same fixture data, then it does not create duplicate rows.
4. Given `DATABASE_URL` or `SEED_OWNER_USER_ID` is missing, when the seed starts, then it fails fast with a clear error before any app-table inserts.
5. Given `SEED_OWNER_USER_ID` does not match an auth user, when the seed starts, then it exits clearly and creates no restaurant graph data.
6. Given the seed completes successfully, when stdout is reviewed, then created/skipped counts are visible by entity type.

## References

- `specs/database-seeds/design.md`
- `specs/database-seeds/plan.md`
- `specs/database-seeds/research/current-state-and-schema.md`
- `specs/database-seeds/research/reference-seed-pattern.md`
- `specs/database-seeds/research/owner-auth-strategy.md`

## Notes

- Prefer a first-pass implementation that treats owner auth creation as a prerequisite, not part of the seed script.
- Keep the implementation narrow and useful for local UI development.
- After implementation, run the relevant validation and verify the owner and public menu flows against the seeded data.
