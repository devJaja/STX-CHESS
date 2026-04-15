# Changelog

All notable changes to Stack Chess are documented here.

---

## [Unreleased]

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
