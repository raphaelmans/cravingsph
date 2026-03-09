# Database Seeds Summary

## Artifacts

- `rough-idea.md`
- `requirements.md`
- `research/current-state-and-schema.md`
- `research/reference-seed-pattern.md`
- `research/owner-auth-strategy.md`
- `design.md`
- `plan.md`

## Brief Overview

This spec bundle defines a safe first-pass database seed strategy for CravingsPH:

- local-development focused,
- idempotent,
- modeled after the reference repo's `tsx` seed scripts,
- designed around one realistic demo restaurant/menu hierarchy,
- careful about the Supabase auth foreign-key dependency.

## Suggested Next Steps

1. Approve the design and implementation plan.
2. Implement the seed runner and fixture module.
3. Create or identify a local owner auth user ID for `SEED_OWNER_USER_ID`.
4. Run the seed against the local database and verify owner and customer menu flows.
