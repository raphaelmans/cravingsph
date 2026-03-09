# Rough Idea

Create database seed scripts for CravingsPH and run them, based on the current repo's Drizzle schema and in relation to `PROMPT_ORIGINAL.md`.

Use the existing seed approach from `/Users/raphaelm/Documents/Coding/boilerplates/next16bp/scripts/seed-sports.ts` as the reference style:

- TypeScript seed script
- Idempotent behavior
- `DATABASE_URL` driven
- Safe for local development

The seed data should be useful for this codebase's current restaurant platform schema, which currently includes:

- organization
- restaurant
- branch
- category
- menu_item
- item_variant
- modifier_group
- modifier

Desired outcome for the planning work:

- Define what seed data should exist
- Define how the seed script(s) should be structured in this repo
- Define how seed execution should be wired into `package.json`
- Define how idempotency and local-dev safety should work
- Prepare a concrete implementation plan for adding and running seeds

Planning note:

This spec bundle is planning-only. It does not implement or execute the seed scripts directly.
