# Decision Journal

## DEC-001
- Decision: Scope Step 13 to single-branch staff smart redirect and keep non-branch cases on the existing post-login behavior for now.
- Chosen Option: Redirect users with exactly one active branch-scoped assignment to `/branch/:portalSlug`; preserve the current owner/customer fallback flow for business-scoped assignments and unassigned users.
- Confidence: 72
- Alternatives Considered: Implement the full plan and send business-scoped assignees to `/organization`; defer Step 13 entirely until owner-console scoped access exists.
- Reasoning: The current owner layout still blocks non-owner access paths, so sending business-scoped assignees to `/organization` would be incorrect today. The single-branch staff redirect is self-contained, aligns with the branch portal auth already shipped, and improves the primary staff workflow without introducing broken routes.
- Reversibility: High. The redirect use case can be extended later once owner-console scoped access is implemented.
- Timestamp (UTC ISO 8601): 2026-03-14T16:24:00Z

## DEC-002
- Decision: How the owner console should behave if one user has active business-scope assignments in multiple organizations.
- Chosen Option: Fail closed for the owner-console resolver instead of selecting an arbitrary organization.
- Confidence: 68
- Alternatives Considered: Pick the first assignment by creation order; keep the old owner-only behavior and ignore business-scope access entirely; add a new organization picker flow in this iteration.
- Reasoning: The current owner console routes and workspace store assume a single active organization context. Guessing would risk cross-org leakage in shared queries and sidebars. A fail-closed resolver preserves security while still unblocking the intended single-business rollout.
- Reversibility: High. Once the product has an org picker or explicit org context in routes, the resolver can be relaxed.
- Timestamp (UTC ISO 8601): 2026-03-15T01:28:00Z
