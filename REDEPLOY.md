# Contract Redeployment Guide

## Changes Made

### Contract Updates
- Fixed `create-game` to properly accept `principal` type for opponent
- Added validation to prevent creating games against yourself (error u105)
- Contract validates successfully with `clarinet check`

### Frontend Updates
- Changed from `stringAsciiCV()` to `principalCV()` for opponent address
- Proper serialization with `serializeCV()` and hex encoding
- All function arguments now match contract expectations

## Contract Interface

### create-game
```clarity
(define-public (create-game (opponent principal))
```
**Frontend call:**
```typescript
principalCV(opponentAddress) // e.g., "SP2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
```

### make-move
```clarity
(define-public (make-move (game-id uint) (move (string-ascii 10)))
```
**Frontend call:**
```typescript
uintCV(gameId)              // e.g., 1
stringAsciiCV(move)         // e.g., "e2e4"
```

### get-game
```clarity
(define-read-only (get-game (game-id uint))
```

## Deployment Steps

### Option 1: Deploy New Contract (Recommended)
```bash
# Update contract address in frontend/lib/stacks.ts
# Deploy to testnet first
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# After testing, deploy to mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

### Option 2: Update Existing Deployment
If you control the existing contract at `SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC`:
1. The contract cannot be modified once deployed
2. You must deploy a new version with a different contract name
3. Update `CONTRACT_NAME` in `frontend/lib/stacks.ts`

## Testing

### Local Testing (Simnet)
```bash
clarinet console

# Test create-game
(contract-call? .chess create-game 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)

# Test make-move
(contract-call? .chess make-move u1 "e2e4")

# Test get-game
(contract-call? .chess get-game u1)
```

### Frontend Testing
1. Connect Leather wallet
2. Enter valid Stacks address (starts with SP for mainnet, ST for testnet)
3. Click "Create Game"
4. Approve transaction in Leather wallet
5. Transaction should broadcast successfully

## Expected Behavior

✅ **Success:**
- Transaction approved in wallet
- Transaction broadcasts to network
- Returns transaction ID
- Game created with ID

❌ **Previous Error:**
- "transaction rejected" after approval
- Caused by type mismatch (string-ascii vs principal)

## Contract Address

Current: `SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC.chess`

If redeploying, update in:
- `frontend/lib/stacks.ts` → `CONTRACT_ADDRESS`
- `frontend/lib/stacks.ts` → `CONTRACT_NAME` (if changed)
