# Emergency Proposal Cancellation

clarvote includes a guardian-based emergency cancellation mechanism for proposals in the timelock queue.

## How It Works

```
Proposal QUEUED (timelock window)
         │
         ▼  guardian calls cancel-proposal
  STATUS → CANCELLED
         │
         ├── Cancellation logged on-chain permanently
         ├── Reason string stored with guardian address + block
         └── Proposer deposit refunded automatically
```

## Guardian Role

- The guardian is a principal (ideally a multisig contract like `clarvote-guardian-multisig`)
- Guardian can **only** cancel proposals in `QUEUED` state
- Guardian **cannot** cancel `pending`, `active`, `passed`, or `executed` proposals
- Guardian role is transferable — current guardian calls `set-guardian`
- Optional: set an expiry block so the guardian auto-expires without renewal

## Cancel a Proposal

```clarity
(contract-call? .clarvote-guardian cancel-proposal
  u5                                   ;; proposal-id
  "Critical reentrancy bug in payload" ;; reason (max 256 chars, stored on-chain)
)
```

## State Machine

```
PENDING → ACTIVE → PASSED → QUEUED → EXECUTED
                                  ↘
                              CANCELLED  ← guardian only, during timelock
```

## Error Codes

| Code | Constant | Meaning |
|------|----------|---------|
| u401 | `ERR-NOT-GUARDIAN` | Caller is not the guardian |
| u403 | `ERR-WRONG-STATE` | Proposal is not in QUEUED state |
| u404 | `ERR-NOT-FOUND` | Proposal does not exist |
| u405 | `ERR-ALREADY-CANCELLED` | Proposal already cancelled |
| u406 | `ERR-GUARDIAN-EXPIRED` | Guardian expiry block has passed |

## Multisig Guardian (Recommended)

For maximum security, set the guardian to `clarvote-guardian-multisig` — a 2-of-3 threshold contract:

```clarity
;; Transfer guardian to multisig
(contract-call? .clarvote-guardian set-guardian .clarvote-guardian-multisig)

;; Each signer approves
(contract-call? .clarvote-guardian-multisig approve-cancellation u5)

;; After 2 approvals, execute
(contract-call? .clarvote-guardian-multisig execute-cancellation u5 "Bug found")
```

## Auditability

Every cancellation is:
1. Emitted as an on-chain `print` event indexed by Hiro API
2. Written to `cancellation-log` map (permanent, queryable)
3. Visible in the frontend Cancellation History panel

No cancellation can be hidden or reversed.
