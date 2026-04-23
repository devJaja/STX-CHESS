# Stack Chess — Scripts

Standalone Node.js scripts for interacting with the deployed `chess-v2` contract on Stacks mainnet.

## Setup

```bash
cp .env.example .env
# Fill in MNEMONIC_WHITE and MNEMONIC_BLACK
npm install
```

## Scripts

### `interact.mjs` — Single contract call

```bash
# Read-only (no wallet needed)
node interact.mjs get-count
node interact.mjs get-game <gameId>
node interact.mjs get-game-status <gameId>
node interact.mjs get-move-count <gameId>

# Write (requires MNEMONIC in .env or env var)
MNEMONIC="..." node interact.mjs create-game <opponentAddress>
MNEMONIC="..." node interact.mjs make-move <gameId> <move>
MNEMONIC="..." node interact.mjs end-game <gameId> <white|black>
MNEMONIC="..." node interact.mjs resign <gameId>
MNEMONIC="..." node interact.mjs offer-draw <gameId>
MNEMONIC="..." node interact.mjs accept-draw <gameId>
```

### `run-interactions.mjs` — Automated 7-game runner

Plays 7 complete games (56 transactions) on mainnet. Requires both `MNEMONIC_WHITE` and `MNEMONIC_BLACK` in `.env`.

```bash
node run-interactions.mjs
```

### `health-check.mjs` — Contract health check

Verifies the contract is reachable and prints basic stats.

```bash
node health-check.mjs
```

### `read-games.mjs` — Batch game reader

Reads and prints a range of games in table format.

```bash
node read-games.mjs [startId] [endId]
node read-games.mjs 1 10
```

## Security

- **Never commit `.env`** — it is gitignored
- Mnemonics are only used locally to sign transactions
- Transactions are broadcast directly to the Stacks network
