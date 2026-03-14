# Proposal: Branch Ops Portal (Feature-Flagged)

## Summary

Introduce a branch-scoped operations portal that gives staff a short, memorable entry point and a branch-limited workspace for daily operations.

## Problem

Today, branch management is nested under long owner URLs:
`/organization/restaurants/:restaurantId/branches/:branchId/...`

This causes several issues:
- too many clicks for common branch tasks
- poor ergonomics for owners with many restaurants and branches
- hard to onboard branch-specific staff with a simple URL
- current role model is too coarse for branch-limited access

## Proposed direction

Add a branch-scoped portal with:
- readable branch URL (for example `/branch/:slug`)
- branch-specific login landing
- branch membership / branch role mapping
- branch-limited navigation and permissions

The existing org owner console remains the higher-level control surface.

## Recommendation

### Recommended v1 scope

Ship this in 2 layers:

1. **Routing + UX shell first**
   - Readable branch portal route
   - Branch landing page / branch dashboard shell
   - Smart post-login redirect for users with exactly one branch
   - Branch switcher only for multi-branch users

2. **Branch-scoped staff auth second**
   - Add branch membership data model
   - Branch roles such as `branch_manager`, `branch_staff`, `branch_viewer`
   - Enforce branch access on branch portal routes and mutations

### Why this order

This lets the team improve daily UX quickly while still isolating permissions correctly in the next layer. It also avoids mixing a major auth rewrite with the first pass of IA/navigation changes.

## Non-goals for first iteration

- custom branch subdomains
- public branch vanity links outside ops use
- replacing the owner org console
- full RBAC matrix beyond branch-scoped daily ops needs

## Open questions

1. Slug format is `<restaurant-name>-<branch-name-or-location>` for readability and uniqueness; collision fallback should append a readable suffix only when needed.
2. Should branch staff be invited through existing admin/owner invitation flow or a new branch invite flow?
3. Should one-branch users skip org console entirely after login?
4. What minimum nav items are needed in branch portal v1: Overview, Orders, Tables, Menu, Settings?
