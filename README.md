# ♟ Stack Chess

> Chess on Bitcoin — every move recorded on the [Stacks](https://stacks.co) blockchain (Bitcoin Layer 2).

---

## Overview

Stack Chess is a fully on-chain chess game. Players connect their Leather wallet, create a game against an opponent, and submit moves as Stacks transactions. The smart contract enforces turn order and stores the full move history on-chain.

## Project Structure

```
stack-chess/
├── contracts/          # Clarity smart contracts
│   └── chess.clar      # Main chess game contract
├── frontend/           # Next.js 14 + Tailwind CSS app
│   ├── app/            # App router pages & layout
│   ├── components/     # UI components
│   └── lib/            # Stacks client, hooks, types
├── tests/              # Clarinet contract tests
├── settings/           # Network configs (secrets excluded)
└── deployments/        # Deployment plans
```

## Smart Contract

`contracts/chess.clar` provides:

| Function | Description |
|---|---|
| `create-game(opponent)` | Start a new game — caller is white |
| `make-move(game-id, move)` | Submit a move, enforces turn order |
| `end-game(game-id, winner-color)` | Declare winner and close game |
| `get-game(game-id)` | Read full game state |
| `get-game-count` | Total games created |

## Frontend

Built with **Next.js 14**, **Tailwind CSS**, and **chess.js** for local move validation.

### Setup

```bash
cd frontend
cp .env.example .env.local   # configure contract address
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract principal |
| `NEXT_PUBLIC_CONTRACT_NAME` | Contract name (default: `chess-v2`) |
| `NEXT_PUBLIC_NETWORK` | `mainnet` or `testnet` |

## Local Development (Simnet)

```bash
# Validate contract
clarinet check

# Interactive console
clarinet console

# Create a game
(contract-call? .chess create-game 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)

# Make a move
(contract-call? .chess make-move u1 "e2e4")
```

## Deployment

### Testnet

1. Get testnet STX: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Add mnemonic to `settings/Testnet.toml`
3. `clarinet deployments apply -p deployments/default.testnet-plan.yaml`

### Mainnet

1. Add mnemonic to `settings/Mainnet.toml`
2. `clarinet deployments apply -p deployments/default.mainnet-plan.yaml`

## Testing

```bash
npm install
npm test
```

## Requirements

- [Clarinet](https://docs.hiro.so/clarinet) 3.x
- Node.js 18+
- [Leather Wallet](https://leather.io) browser extension

## Resources

- [Clarity Language Docs](https://docs.stacks.co/clarity)
- [Stacks.js](https://github.com/hirosystems/stacks.js)
- [Clarinet Docs](https://docs.hiro.so/clarinet)
