# Contributing to Stack Chess

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone
git clone https://github.com/devJaja/STX-CHESS.git
cd STX-CHESS

# Install contract test deps
npm install

# Install frontend deps
cd frontend && npm install

# Run contract tests
cd .. && npm test

# Run frontend dev server
cd frontend && npm run dev
```

## Project Structure

- `contracts/` — Clarity smart contract
- `frontend/` — Next.js 15 app
- `scripts/` — Node.js mainnet interaction scripts
- `tests/` — Clarinet/Vitest contract tests

## Making Changes

1. **Contract changes** — update `contracts/chess.clar` and add tests in `tests/chess.test.ts`
2. **Frontend changes** — components in `frontend/components/`, hooks in `frontend/lib/`
3. **Scripts** — standalone `.mjs` files in `scripts/`

## Before Submitting a PR

- Run `npm test` — all 28 tests must pass
- Run `cd frontend && npm run build` — must compile without errors
- Never commit `.env` files or mnemonics
- Follow the existing commit message format: `type(scope): description`

## Commit Types

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without feature/fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build, config, dependencies |
| `style` | Formatting, CSS |
| `ci` | CI/CD changes |
| `security` | Security improvements |
| `a11y` | Accessibility improvements |

## Security

- **Never expose mnemonics or private keys** in code, commits, or issues
- Report security vulnerabilities privately via GitHub Security Advisories
