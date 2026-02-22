# clarvote

> On-chain governance and voting DAO built with Clarity on Stacks

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Language-Clarity-orange)](https://clarity-lang.org)

## Overview

**clarvote** is a fully on-chain governance protocol for the Stacks blockchain. Organizations, DAOs, and communities can create proposals, delegate voting power, and execute decisions — all secured by Clarity smart contracts and Bitcoin's finality.

No off-chain signatures. No multisig backdoors. Every vote is verifiable, permanent, and tamper-proof on Bitcoin L2.

---

## Features

- **Proposal Lifecycle** — create, vote, queue, and execute proposals entirely on-chain
- **Token-Weighted Voting** — voting power derived from any SIP-010 governance token
- **Delegation** — delegate your voting power to trusted community members
- **Timelocks** — mandatory execution delay after a proposal passes for security
- **Quorum & Threshold Config** — fully configurable per-DAO
- **Multi-DAO Support** — deploy multiple independent DAOs from one factory contract
- **Treasury Management** — built-in STX and SIP-010 treasury controlled by governance
- **Emergency Veto** — guardian role with limited veto rights for critical situations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Clarity (Stacks) |
| Frontend | Next.js 14 + TypeScript |
| Blockchain SDK | Stacks.js |
| Wallet Integration | Hiro Wallet, Leather Wallet |
| Indexer | Hiro Platform API |
| Storage | IPFS (proposal metadata) |
| Testing | Clarinet + Vitest |

---

## Architecture

```
clarvote/
├── contracts/
│   ├── clarvote-core.clar        # Main governance logic
│   ├── clarvote-token.clar       # SIP-010 governance token
│   ├── clarvote-treasury.clar    # DAO treasury
│   ├── clarvote-factory.clar     # Multi-DAO factory
│   └── traits/
│       ├── governance-trait.clar
│       └── treasury-trait.clar
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
├── tests/
│   ├── governance.test.ts
│   └── treasury.test.ts
└── scripts/
    └── deploy.ts
```

---

## Proposal Lifecycle

```
CREATE → ACTIVE → [PASSED | DEFEATED] → QUEUED → EXECUTED
                                              ↓
                                         (timelock)
```

| State | Description |
|-------|-------------|
| `pending` | Proposal created, voting not yet started |
| `active` | Voting window is open |
| `passed` | Quorum met, threshold reached |
| `defeated` | Failed to meet quorum or threshold |
| `queued` | Awaiting timelock execution delay |
| `executed` | Successfully executed on-chain |
| `cancelled` | Cancelled by proposer or guardian |

---

## Smart Contract Interface

### Create a Proposal
```clarity
(contract-call? .clarvote-core create-proposal
  "Increase treasury allocation for developer grants"  ;; title
  0x...                                                ;; IPFS hash of full description
  u14400                                               ;; voting period (blocks)
  u100000000                                           ;; execution timelock (blocks)
)
```

### Cast a Vote
```clarity
(contract-call? .clarvote-core cast-vote
  u1          ;; proposal-id
  true        ;; vote-for (true=yes, false=no)
  u5000000    ;; token amount to lock for vote
)
```

### Delegate Voting Power
```clarity
(contract-call? .clarvote-core delegate
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ  ;; delegate address
)
```

### Execute a Passed Proposal
```clarity
(contract-call? .clarvote-core execute-proposal u1)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0
- [Hiro Wallet](https://wallet.hiro.so/) or [Leather Wallet](https://leather.io/)

### Installation

```bash
git clone https://github.com/thewealthyplace/clarvote
cd clarvote
npm install
```

### Run Local Devnet

```bash
clarinet devnet start
```

### Deploy Contracts

```bash
# Testnet
clarinet deployments apply --testnet

# Mainnet
clarinet deployments apply --mainnet
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Governance Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `voting-period` | 14400 blocks (~5 days) | How long voting is open |
| `timelock-period` | 4320 blocks (~30 hours) | Delay before execution |
| `quorum` | 10% of supply | Minimum participation |
| `threshold` | 60% | Minimum yes-vote percentage |
| `proposal-threshold` | 100,000 tokens | Tokens needed to create proposal |

---

## Security

- All contract state transitions are explicit and auditable
- Timelocks prevent flash-loan governance attacks
- Voting tokens are locked during the voting period
- Guardian veto is limited in scope and logs every action
- Full Clarinet test suite with edge case coverage

---

## Roadmap

- [x] Core governance contracts
- [x] Delegation system
- [x] Treasury management
- [ ] Cross-contract proposal execution
- [ ] Frontend dashboard
- [ ] Mobile wallet support
- [ ] Snapshot-style off-chain signaling layer
- [ ] Plugin hooks for custom vote-counting logic

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

```bash
git clone https://github.com/thewealthyplace/clarvote
cd clarvote
npm install
clarinet check    # validate contracts
clarinet test     # run test suite
```

---

## License

MIT © [thewealthyplace](https://github.com/thewealthyplace)

---

## Resources

- [Stacks Governance SIPs](https://github.com/stacksgov/sips)
- [Clarity Smart Contract Language](https://clarity-lang.org)
- [Stacks.js Documentation](https://stacks.js.org)
- [Hiro Platform](https://platform.hiro.so)
