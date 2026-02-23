# Mainnet Deployment Instructions

## Prerequisites

1. **STX Balance**: Ensure you have enough STX for deployment fees (~0.5-1 STX)
2. **Mnemonic**: Your 12 or 24-word recovery phrase
3. **Clarinet**: Version 3.x installed

## Step 1: Configure Mnemonic

⚠️ **NEVER commit your mnemonic to git!**

Edit `settings/Mainnet.toml`:
```toml
[accounts.deployer]
mnemonic = "your twelve word recovery phrase goes here"
```

This file is already in `.gitignore` for security.

## Step 2: Verify Contract

```bash
clarinet check
```

Should show: `✔ 1 contract checked`

## Step 3: Deploy

### Option A: Using Script (Recommended)
```bash
./deploy-mainnet.sh
```

### Option B: Manual Deployment
```bash
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## Step 4: Update Frontend

After successful deployment, update `frontend/lib/stacks.ts`:

```typescript
export const CONTRACT_ADDRESS = 'YOUR_NEW_ADDRESS_HERE';
export const CONTRACT_NAME = 'chess';
```

## Expected Output

```
✔ Contract deployed successfully
Transaction ID: 0x...
Contract Address: SP...
```

## Troubleshooting

### "Insufficient balance"
- Check STX balance: https://explorer.hiro.so/address/YOUR_ADDRESS?chain=mainnet
- Get STX from an exchange

### "Invalid mnemonic"
- Verify mnemonic is correct (12 or 24 words)
- Check for extra spaces or typos

### "Contract already exists"
- Change contract name in `Clarinet.toml`
- Or deploy from a different address

## Security Notes

- ✅ `settings/Mainnet.toml` is in `.gitignore`
- ✅ Never share your mnemonic
- ✅ Use a dedicated deployment wallet
- ✅ Test on testnet first

## Cost Estimate

- Contract deployment: ~0.5-1 STX
- Varies based on contract size and network congestion
