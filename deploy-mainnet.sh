#!/bin/bash

# Mainnet Deployment Script for Stack Chess

echo "🚀 Stack Chess - Mainnet Deployment"
echo "===================================="
echo ""

# Check if mnemonic is set
if grep -q "<your-mainnet-mnemonic>" settings/Mainnet.toml; then
    echo "❌ Error: Mainnet mnemonic not configured"
    echo ""
    echo "Please update settings/Mainnet.toml with your mnemonic:"
    echo "  mnemonic = \"your twelve word mnemonic phrase here\""
    echo ""
    echo "⚠️  IMPORTANT: Never commit this file to git!"
    echo "   It's already in .gitignore for your protection."
    exit 1
fi

# Validate contract
echo "📝 Validating contract..."
clarinet check
if [ $? -ne 0 ]; then
    echo "❌ Contract validation failed"
    exit 1
fi
echo "✅ Contract validated"
echo ""

# Show deployment plan
echo "📋 Deployment Plan:"
echo "   Network: Mainnet"
echo "   Contract: chess.clar"
echo "   Node: https://api.hiro.so"
echo ""

# Confirm deployment
read -p "⚠️  Deploy to MAINNET? This will cost STX. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Deploy
echo ""
echo "🚀 Deploying to mainnet..."
clarinet deployments apply -p deployments/default.mainnet-plan.yaml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Note your contract address from the output above"
    echo "   2. Update frontend/lib/stacks.ts with the new address"
    echo "   3. Test the contract on mainnet"
else
    echo ""
    echo "❌ Deployment failed"
    echo "   Check your STX balance and mnemonic"
fi
