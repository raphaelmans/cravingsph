# Agent Plans Context

References and context for planning artifacts.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-11 | Initial creation. Added PRD + alignment OpenSpec + gap issue pack references for Track A planning. |

---

## Product Requirements

| Document | Path | Description |
|----------|------|-------------|
| PRD | `docs/prd.md` | Current repo PRD baseline |
| Alignment OpenSpec | `openspec/changes/alignment-track-a-ff/` | Track A requirement deltas (table-first, immutability, owner ops control plane) |

---

## Design References

| Document | Path | Description |
|----------|------|-------------|
| Alignment issue pack | `issues/alignment-track-a/` | Detailed implementation gap analysis used as input for new stories |

---

## Captured Requirements

- Release target is **Track A**: table-first dine-in flow.
- Submitted orders are **immutable** (ledger-style behavior).
- Ordering must require valid table/session capability.
- Owner side must support deterministic operations: intake control, table session lifecycle, branch-scoped inbox.
- Deferred features (saved/reviews etc.) stay hidden for v1.
