# Vote Delegation

clarvote supports on-chain vote delegation with multi-level chains (up to 5 levels deep).

## How It Works

Token holders who don't want to vote on every proposal can delegate their voting power to a trusted representative. The delegate accumulates power from all delegators and votes on their behalf.

```
Alice (1000 CVOTE) ──delegates to──▶ Bob (500 CVOTE) ──delegates to──▶ Carol
                                                                          │
                                                              Votes with 1500 CVOTE
```

## Delegation Rules

| Rule | Detail |
|------|--------|
| Max chain depth | 5 levels |
| Self-delegation | Not allowed (error u400) |
| Circular chains | Detected and rejected (error u401) |
| Revocable | Any time — effective from next proposal |
| Per-proposal override | Delegator can vote directly on any single proposal |

## Contract Functions

### `delegate (delegatee principal)`
Delegates all your voting power to `delegatee`.

```clarity
(contract-call? .clarvote-delegation delegate 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ)
```

### `undelegate`
Removes your delegation and reclaims your voting power.

```clarity
(contract-call? .clarvote-delegation undelegate)
```

### `get-delegate (voter principal)`
Returns the direct delegatee for a voter, or `none`.

### `get-resolved-delegate (voter principal)`
Returns the terminal delegate at the end of the chain.

### Per-Proposal Override

Even while delegating, you can vote directly on a specific proposal:

```clarity
;; Step 1: Register your intent to override for proposal #5
(contract-call? .clarvote-override set-override u5)

;; Step 2: Cast your vote directly (override is active)
(contract-call? .clarvote-core cast-vote u5 true u1000)
```

## Error Codes

| Code | Constant | Meaning |
|------|----------|---------|
| u400 | `ERR-SELF-DELEGATION` | Cannot delegate to yourself |
| u401 | `ERR-CIRCULAR-DELEGATION` | Delegation would create a cycle |
| u402 | `ERR-MAX-DEPTH-EXCEEDED` | Chain exceeds 5 levels |
| u403 | `ERR-NOT-DELEGATING` | Undelegate called but not delegating |
| u450 | `ERR-ALREADY-OVERRIDDEN` | Override already set for this proposal |

## Security Notes

- Delegation changes do **not** retroactively affect ongoing proposals
- The cycle detection traverses up to 5 hops — O(1) in Clarity
- Power is computed at vote time, not at delegation time
