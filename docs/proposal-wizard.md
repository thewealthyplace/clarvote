# Proposal Creation Wizard

The clarvote frontend includes a 4-step guided proposal wizard for non-technical DAO members.

## Prerequisites

- Connected Hiro or Leather wallet
- Token balance ≥ proposal threshold (default: 100,000 CVOTE)

## Wizard Steps

### Step 1 — Title & Category
- Enter a title (5–120 characters)
- Choose a category: Treasury, Parameter Change, Protocol Upgrade, or Other

### Step 2 — Description
- Write a full markdown description (minimum 100 characters)
- Toggle between **Write** and **Preview** tabs
- Preview renders markdown headers, bold, italic, and lists

### Step 3 — On-Chain Actions (Optional)
- Attach executable contract calls to run if the proposal passes
- Specify: contract address, function name, JSON arguments
- Skip for signalling-only proposals

### Step 4 — Review & Submit
- Review all entered data
- Select a voting period (3 / 5 / 7 / 14 days)
- Click **Submit Proposal**:
  1. Metadata uploaded to IPFS via nft.storage
  2. CID returned and stored
  3. Wallet signature prompt opens
  4. `create-proposal` called on-chain with CID + voting period

## IPFS Metadata Schema

```json
{
  "title": "Increase developer grant budget",
  "category": "treasury",
  "body": "## Motivation\n...",
  "author": "SP1ABC...XYZ",
  "created": "2025-02-01T00:00:00Z",
  "actions": [
    {
      "contract": "SP1ABC.treasury",
      "function": "transfer",
      "args": "[\"SP2RECIPIENT\", 100000000]"
    }
  ]
}
```

## Environment Variables

```env
NEXT_PUBLIC_NFT_STORAGE_API_KEY=your_key
NEXT_PUBLIC_CLARVOTE_CONTRACT_ADDRESS=SP...
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=SP...
NEXT_PUBLIC_NETWORK=mainnet
```
