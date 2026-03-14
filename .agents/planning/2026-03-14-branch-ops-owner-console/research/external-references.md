# Research: External References

## shadcn Sidebar & Workspace Switcher Patterns

The shadcn/ui sidebar component provides a well-documented workspace switcher pattern:

- **Header region** contains a `DropdownMenu` with a `SidebarMenuButton` for workspace selection
- Workspace items render as selectable dropdown options (name, icon, plan badge)
- Sidebar body stays stable — only the workspace context changes
- Config-first approach: navigation structure defined as data, rendered declaratively
- Recommended to memoize navigation trees and avoid inline functions

The project already uses shadcn/ui `new-york` style. The sidebar component is available and the proposal aligns with established shadcn patterns.

**Key reference:** [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar) — official docs with workspace switcher examples.

## Multi-Tenant RBAC Best Practices

Key patterns from industry:

### Role Template + Scope (Two-Dimensional)
The proposal's approach of separating **role template** from **scope** is a recognized best practice. WorkOS recommends keeping a global "base set" of role templates that tenants can't modify in v1, with customization added later.

### Membership + Scoped Assignments
The proposed `membership + scoped_assignment` model follows the pattern recommended by Permit.io and Auth0:
- **Membership** answers: "is this user part of the ecosystem?"
- **Scoped assignment** answers: "what can they do, and where?"

### Enforcement at API Layer
RBAC that lives only in UI is fragile. Enforcement must happen at the API/service layer. The current codebase already does this via service-layer ownership checks — the new model extends that pattern.

### Simplified User-Facing Hierarchy
Hiding internal complexity (Platform → Org → Restaurant → Branch) behind a simpler model (Platform → Business → Branch) is recommended. Users shouldn't need to reason about implementation-level hierarchy for common operations.

### Sources

- [WorkOS: How to design RBAC for multi-tenant SaaS](https://workos.com/blog/how-to-design-multi-tenant-rbac-saas)
- [Permit.io: Best Practices for Multi-Tenant Authorization](https://www.permit.io/blog/best-practices-for-multi-tenant-authorization)
- [Auth0: Choosing Authorization Model for Multi-Tenant SaaS](https://auth0.com/blog/how-to-choose-the-right-authorization-model-for-your-multi-tenant-saas-application/)
- [LoginRadius: Access Control for Multi-Tenant B2B](https://www.loginradius.com/blog/engineering/rbac-saas-multi-tenant-b2b-platforms)
- [shadcn/ui Sidebar Blocks](https://ui.shadcn.com/blocks/sidebar)
