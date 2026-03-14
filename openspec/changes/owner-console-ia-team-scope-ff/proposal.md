# Proposal: Owner Console IA + Team Scope (Feature-Flagged)

## Summary

Restructure the owner sidebar and owner console information architecture so multi-restaurant operations feel manageable, and introduce a forward-compatible model for team access and scope assignment.

## Problem

Today the owner sidebar mixes setup, overview, account, restaurants, restaurant nesting, and branches in one expanding tree. This creates several UX problems:
- too much scanning cost for owners with many restaurants/branches
- branch pages are buried inside nested navigation
- no clear distinction between org-level tasks and branch-level tasks
- no obvious home for future team access and role scoping

## Design recommendation

Use a **workspace-style sidebar**, inspired by shadcn sidebar patterns:

### Header
- workspace switcher / current context selector
- shows current organization
- optional quick switch between restaurants / branches

### Primary groups
- Overview
- Restaurants
- Branch Operations
- Team Access
- Account

### Key IA shift
Do **not** make the sidebar the full org tree.
Instead:
- sidebar = top-level task areas
- content area = list/detail pages, switchers, branch cards, and scoped actions

This reduces sidebar density and keeps the left rail stable.

## Recommended v1 scope

### Part A — Owner sidebar v2
- replace deep nested sidebar tree with flatter grouped nav
- add workspace switcher in sidebar header
- make Restaurants open a list/index page, not the full hierarchy inline
- add clear branch shortcut entry points that route into `/branch/:slug`
- add a clear Team Access entry even if initial functionality is limited

### Part B — Team access foundation
- define business-level and branch-level access assignment model
- support branch scoping for staff
- make role scope visible in UI

## Recommended information architecture

### Owner console
- **Overview**
  - dashboard
  - setup health / alerts
- **Restaurants**
  - all restaurants
  - restaurant detail pages
- **Branch Operations**
  - branch switcher / quick access
  - shortcut links into `/branch/:slug`
  - orders
  - tables
  - settings
- **Team Access**
  - members
  - invites
  - scopes / assigned branches
- **Account**
  - profile

## Recommendation on roles/scoping

Use two layers of hierarchy:

### Data hierarchy (internal)
- Platform
- Organization
- Restaurant
- Branch

### User-facing RBAC hierarchy (v1)
- Platform
- Business
- Branch

In other words, keep the database/domain model detailed, but simplify the access model owners see in the UI.
For team access, **Business** acts as the combined org/restaurant management layer, while **Branch** acts as the day-to-day operational layer.

Use two dimensions, not one flat role string:

1. **Role template**
- `platform_admin`
- `business_owner`
- `business_manager`
- `business_viewer`
- `branch_manager`
- `branch_staff`
- `branch_viewer`

2. **Scope**
- `business`
- `branch`

This is much cleaner than trying to encode all meaning into one role string.

## Access model recommendation

Use **membership + scoped assignments**, not a single flat org role.

### Membership
Answers:
- is this user part of the business ecosystem at all?

### Scoped assignments
Answers:
- what can this user manage?
- at what scope?
- for which target?

Recommended shape:
- `user_id`
- `business_id`
- `role_template`
- `scope_type` (`business | branch`)
- `scope_id`
- `status` (`active | revoked | pending`)

This keeps invites and membership simple while allowing branch-only staff access later.

## Why this works

- owner can manage many restaurants without drowning in nested links
- branch staff can be scoped precisely without exposing the whole business
- Team Access becomes a first-class concept, not an afterthought
- sidebar stays stable even as more branches are added
- v1 can ship with role templates first instead of a checkbox-heavy RBAC UI

## Non-goals for first iteration

- full permissions matrix UI
- branch portal replacement of owner console
- custom subdomains or branded staff portals
- org chart / HR-style people directory
- per-user custom permission checkbox explosion for every operational action

## Open questions

1. Branch Operations should act as the owner-side shortcut layer into readable `/branch/:slug` operational routes.
2. Should the workspace switcher switch only restaurants, or both restaurants and branches?
3. Should Team Access launch at business level first, with branch scope added in detail pages?
4. Which should come first in implementation: sidebar v2 or scoped team data model?
