# Research: Feature Flag Infrastructure

## Summary

**No feature flag infrastructure exists.** The codebase has zero feature flag patterns — no third-party services, no database tables, no environment variables, no runtime toggles.

## What Was Searched

- `featureFlag`, `feature_flag`, `FF_`, `ff.` — zero matches
- LaunchDarkly, Unleash, PostHog, Flagsmith, Split.io — not installed
- No feature flag table in DB schema
- No feature flag environment variables in `src/lib/env/`

## Existing Toggle-Like Patterns

These are **not feature flags**, but similar control points:

| Pattern | Location | Purpose |
|---------|----------|---------|
| `isActive` columns | organization, restaurant, branch, branch-table | Soft-delete / enable-disable |
| `isFeatured` | restaurant | Admin curation |
| `isOrderingEnabled` | branch | Ordering on/off toggle |
| `portalPreference` | profile | Customer vs owner experience |
| `verificationStatus` | restaurant | Approval workflow |

## Implication

A feature flag system needs to be **built from scratch** for both proposals. Options:

### Option A: Environment Variable Flags (simplest)
```
FF_BRANCH_OPS_PORTAL=true
FF_BRANCH_SCOPED_STAFF_ACCESS=true
FF_OWNER_CONSOLE_SIDEBAR_V2=true
```
- Pros: Zero infrastructure, deploy-time control
- Cons: Requires redeploy to toggle, no per-user targeting

### Option B: Database Flag Table
```sql
CREATE TABLE feature_flags (
  key VARCHAR PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  scope VARCHAR, -- 'global' | 'organization' | 'user'
  scope_id UUID,
  created_at TIMESTAMPTZ
);
```
- Pros: Runtime toggling, per-org/per-user targeting
- Cons: More infrastructure, cache invalidation needed

### Option C: Lightweight Config Object
```typescript
const flags = {
  branchOpsPortal: env.FF_BRANCH_OPS_PORTAL === "true",
  ownerSidebarV2: env.FF_OWNER_CONSOLE_SIDEBAR_V2 === "true",
  // ...
} as const;
```
- Pros: Type-safe, minimal overhead, good enough for phased rollout
- Cons: Still deploy-time, no runtime changes

### Recommendation

Start with **Option C** (env-backed typed config) for initial rollout. Upgrade to database flags only if per-organization targeting becomes necessary. The proposals suggest controlled rollout (dogfood on one test branch), which env flags can handle.
