# ♟ Stack Chess

> Chess on Bitcoin — every move recorded on the [Stacks](https://stacks.co) blockchain (Bitcoin Layer 2).

---

## Overview

Stack Chess is a fully on-chain chess game. Players connect their Leather wallet, create a game against an opponent, and submit moves as Stacks transactions. The smart contract enforces turn order, stores the full move history on-chain, and supports resign and draw mechanics.

**Live contract:** [`SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC.chess-v2`](https://explorer.hiro.so/address/SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC?chain=mainnet)

## Project Structure

```
stack-chess/
├── contracts/          # Clarity smart contracts
│   └── chess.clar      # Main chess game contract
├── frontend/           # Next.js 15 + Tailwind CSS app
│   ├── app/            # App router pages & layout
│   ├── components/     # UI components
│   └── lib/            # Stacks client, hooks, types
├── scripts/            # Node.js mainnet interaction scripts
├── tests/              # Clarinet contract tests (28 tests)
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
| `resign(game-id)` | Forfeit — opponent wins |
| `offer-draw(game-id)` | Offer a draw to the opponent |
| `accept-draw(game-id)` | Accept a pending draw offer |
| `get-game(game-id)` | Read full game state |
| `get-game-status(game-id)` | Read game status only |
| `get-move-count(game-id)` | Read number of moves played |
| `get-game-count` | Total games created |

### Game Statuses
- `active` — game in progress
- `finished` — winner declared via `end-game`
- `resigned` — a player resigned
- `draw` — draw accepted by both players

## Frontend

Built with **Next.js 15**, **Tailwind CSS**, and **chess.js** for local move validation.

### Features
- ♟ Interactive chess board with legal move highlighting
- 🔄 Last-move highlight and board flip
- ⏱ Per-player move timer
- 📋 Captured pieces with material advantage
- 📜 Move history panel
- 🎮 Game list showing your recent on-chain games
- 🔗 Copy game link (shareable URL with `?game=ID`)
- 🔔 Toast notifications for all actions
- 🌙 Dark/light theme toggle
- ♿ Keyboard-navigable board with ARIA labels

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

## Scripts

Standalone Node.js scripts for direct contract interaction:

```bash
cd scripts
cp .env.example .env   # add your mnemonics

# Read
node interact.mjs get-count
node interact.mjs get-game 1
node interact.mjs get-game-status 1
node interact.mjs get-move-count 1

# Write (requires MNEMONIC in .env)
MNEMONIC="..." node interact.mjs create-game SP2ABC...
MNEMONIC="..." node interact.mjs make-move 1 e2e4
MNEMONIC="..." node interact.mjs resign 1
MNEMONIC="..." node interact.mjs offer-draw 1
MNEMONIC="..." node interact.mjs accept-draw 1

# Run 56 automated mainnet interactions (7 games)
node run-interactions.mjs
```

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

# Resign
(contract-call? .chess resign u1)
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

28 tests covering all contract functions including resign, draw mechanics, and edge cases.

## Requirements

- [Clarinet](https://docs.hiro.so/clarinet) 3.x
- Node.js 18+
- [Leather Wallet](https://leather.io) browser extension

## Resources

- [Clarity Language Docs](https://docs.stacks.co/clarity)
- [Stacks.js](https://github.com/hirosystems/stacks.js)
- [Clarinet Docs](https://docs.hiro.so/clarinet)
- [Live Contract Explorer](https://explorer.hiro.so/address/SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC?chain=mainnet)
