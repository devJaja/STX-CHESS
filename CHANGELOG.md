# Changelog

All notable changes to Stack Chess are documented here.

---

## [Unreleased]

### Added
- `resign` contract function — caller forfeits, opponent wins, status set to `resigned`
- `offer-draw` contract function — stores offerer's principal in `draw-offered-by`
- `accept-draw` contract function — closes game with status `draw`, guards against self-acceptance
- `get-game-status` read-only helper — returns status string without fetching full game
- `get-move-count` read-only helper — returns move count without fetching full game
- Block-height timestamps (`created-at`, `ended-at`) stored in every game
- `ERR-DRAW-NOT-OFFERED` (u106) and `ERR-ALREADY-OFFERED` (u107) error constants
- `is-participant` private helper used in `end-game`, `resign`, `offer-draw`, `accept-draw`
- `make-move` now clears `draw-offered-by` when a move is played
- 28-test suite covering all contract functions, resign, draw, edge cases
- `Toast` component — success/error/info notifications with auto-dismiss
- `CapturedPieces` component — shows captured pieces with material advantage score
- `MoveTimer` component — per-player elapsed time, stops when game ends
- `GameList` component — shows player's recent on-chain games with status badges
- Board flip button — swap perspective between white and black
- Last-move highlight on chess board (yellow tint)
- `onTurnChange` callback from `ChessBoard` to parent
- `?game=ID` URL param — load a game directly from a shareable link
- Copy game link button in `GameControls`
- Resign button in `GameControls`
- Offer Draw / Accept Draw buttons in `GameControls`
- `getGameStatus` and `getMoveCount` helpers in `lib/stacks.ts`
- `limit` parameter on `getGamesByPlayer`
- `OnChainGame` type in `lib/types.ts` with all new fields
- `useGameSync` auto-stops polling when game status is not `active`
- `useGameSync` poll interval reduced from 15s to 12s
- `WalletConnect` shows "Connecting…" state during wallet request
- OpenGraph metadata in `app/layout.tsx`
- Custom scrollbar and focus-visible ring in `globals.css`
- Tailwind config extended with CSS token colors, font families, fade-in animation
- CI: security audit job (`npm audit --audit-level=high`)
- CI: secret scan job — checks git history for accidental mnemonic commits
- `scripts/.env.example` — safe template for scripts configuration
- `scripts/interact.mjs` — full CLI for all contract functions
- `scripts/run-interactions.mjs` — automated 7-game mainnet runner (56 txs)
- CSP tightened: `connect-src` restricted to Hiro API and Stacks nodes

### Changed
- `end-game` now uses `is-participant` helper (consistent with other functions)
- `GameControls` uses `toast()` instead of `alert()` for all notifications
- `handleError` uses `toast()` instead of `alert()`

### Fixed
- `useGameSync` no longer keeps polling after game ends (wasted API calls)

---

## [2.0.0] — 2026-04-21

### Added
- `useGameSync` hook: polls chain state every 15s to keep board in sync with opponent moves
- `JoinGame` sub-component: load any existing game by ID without creating a new one
- Testnet deployment plan (`deployments/default.testnet-plan.yaml`)
- GitHub Actions CI workflow: contract tests + frontend lint/typecheck/build
- Clarinet/Vitest contract test suite (6 tests covering all core contract paths)
- `end-game` UI: "Declare White Wins" / "Declare Black Wins" buttons in GameControls
- StatusBar now shows total on-chain game count from `get-game-count`
- Escape key deselects active square on the chess board
- Auto-promote pawns to queen on promotion moves
- `StatusBar` component showing live network and contract info
- `useLeather` hook centralising all Leather wallet calls
- Shared `GameState` types in `lib/types.ts`
- Move history panel on the chess board
- Rank/file coordinate labels on the board
- Aria labels on board squares for accessibility
- `.env.example` for frontend configuration

### Changed
- Contract config now reads from `NEXT_PUBLIC_*` env vars
- `ThemeProvider` initialises from `localStorage` immediately (no flash)
- `ThemeToggle` uses inline SVG icons instead of emoji
- `WalletConnect` uses `useCallback` and hoisted `userSession`
- `GameControls` uses `useLeather` hook and `useCallback`
- `ChessBoard` piece lookup simplified to a clean map
- `chess.clar` refactored with consistent naming, helper functions, and comments
- `tailwind.config.ts` maps CSS token vars to Tailwind color palette
- `.gitignore` reorganised with section comments

### Fixed
- `end-game` now guards against calling on already-finished games
- `@import` moved before `@tailwind` directives in `globals.css`
- Removed stale `principalCV` / `stringAsciiCV` duplicate imports

---

## [1.0.0] — Initial Release

- On-chain chess via Stacks / Clarity smart contract
- Next.js 14 frontend with Tailwind CSS and dark mode
- Leather wallet integration
- chess.js for local move validation
