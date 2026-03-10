# US-01-05: Payment proof lifecycle is consistent across customer and owner views

**Status:** Active  
**Supersedes:** -  
**Superseded By:** -

---

## Story

As a **customer and owner**, I want a **consistent payment-proof lifecycle** so that **submission, review, and final state are unambiguous**.

---

## Acceptance Criteria

### Customer submits proof

- Given payment proof is required by policy
- When customer submits reference/proof
- Then payment state becomes submitted and data is persisted

### Owner reviews proof

- Given payment state is submitted
- When owner confirms or rejects proof
- Then payment state changes accordingly and appears in timeline

### Cross-surface consistency

- Given payment status changed
- When customer and owner pages refresh
- Then both surfaces show the same latest payment state

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Duplicate proof submit | Latest valid submission policy is applied deterministically |
| Owner rejects without reason | System supports optional reason but records action |
| Missing screenshot | Flow still supports reference-only submission per policy |

---

## Form Fields (if applicable)

| Field | Type | Required |
|-------|------|----------|
| referenceNumber | text | Yes |
| proofImage | file | No |
| rejectionReason | text | No |

---

## References

- OpenSpec: `order-ledger-immutability` (timeline consistency)
- Alignment gap: payment submit/review mismatch
