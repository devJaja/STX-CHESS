# Changelog

All notable changes to Stack Chess are documented here.

---

## [Unreleased]

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

### Changed
- `CONTRACT_ADDRESS` fallback changed from hardcoded mainnet principal to empty string — misconfigured deployments now fail loudly
- `handleError` moved outside component scope (no state dependencies)
- `endGame` signature narrowed to `'white' | 'black'` — removed broken draw path (contract has no draw concept)
- StatusBar indicator is green for mainnet, yellow for testnet
- `WalletConnect` reads `stxAddress.testnet` when `NEXT_PUBLIC_NETWORK=testnet`
- `ChessBoard` moves on a `Chess` copy before setting state (prevents partial mutation on error)
- `ChessBoard` resets fully when `gameId` is cleared
- `LeatherResponse` type extended with `value` field

### Fixed
- `StatusBar` no longer crashes when `CONTRACT_ADDRESS` is empty
- Wallet session restore always uses the correct network address
- Pawn promotion moves now encoded correctly in on-chain move string

---

### Added
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
