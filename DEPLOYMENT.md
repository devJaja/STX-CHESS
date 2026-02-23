# Chess Contract Mainnet Deployment Guide

## Prerequisites

1. **Get STX for deployment fees** (~0.5 STX minimum)
   - Buy STX on an exchange (Coinbase, Binance, etc.)
   - Transfer to your wallet

2. **Set up your mainnet wallet mnemonic**
   
   Edit `settings/Mainnet.toml` and replace `<your-mainnet-mnemonic>` with your 24-word seed phrase:
   
   ```toml
   [accounts.deployer]
   mnemonic = "word1 word2 word3 ... word24"
   ```

   ⚠️ **IMPORTANT**: Never commit this file to git! It's already in .gitignore.

## Deploy to Mainnet

```bash
# Validate contract
clarinet check

# Deploy to mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml

# This will:
# 1. Show you the deployment plan
# 2. Ask for confirmation
# 3. Broadcast the transaction
# 4. Return your contract address
```

## After Deployment

1. Copy the deployed contract address (format: `SP...`)
2. Update `frontend/lib/stacks.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = 'SP1234...'; // Your deployed address
   ```

3. Rebuild frontend:
   ```bash
   cd frontend
   npm run build
   ```

## Verify Deployment

Check your contract on Stacks Explorer:
https://explorer.hiro.so/txid/YOUR_TX_ID?chain=mainnet

## Estimated Costs

- Contract deployment: ~0.3-0.5 STX
- Transaction fees: ~0.001 STX per transaction
