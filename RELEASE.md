## Stack Chess v2.1 — Release Summary

This release adds full game lifecycle support, a richer frontend, and production-grade tooling.

### Contract (`chess-v2`)
- `resign`, `offer-draw`, `accept-draw` functions
- Block-height timestamps on all games
- `get-game-status` and `get-move-count` read-only helpers
- 28-test suite covering all paths

### Frontend
- Toast notifications, captured pieces, move timer, game list
- Board flip, last-move highlight, shareable game links
- Resign and draw UI buttons
- Respects `prefers-color-scheme` on first visit

### Scripts
- `interact.mjs` — full CLI for all contract functions
- `run-interactions.mjs` — 56-tx automated game runner
- `health-check.mjs` — contract reachability check
- `read-games.mjs` — batch game table reader

### Infrastructure
- CI: security audit + secret scan jobs
- Vercel deployment workflow
- CONTRIBUTING.md, SECURITY.md, LICENSE, issue templates
