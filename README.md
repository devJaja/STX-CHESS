# Stack Chess - Chess on Bitcoin via Stacks

A decentralized chess game built on Stacks blockchain (Bitcoin Layer 2) with Next.js and Tailwind CSS frontend.

## Project Structure

```
stack-chess/
├── contracts/          # Clarity smart contracts
│   └── chess.clar     # Main chess game contract
├── frontend/          # Next.js + Tailwind CSS frontend
├── tests/             # Contract tests
├── settings/          # Network configurations
└── deployments/       # Deployment plans
```

## Smart Contract

The chess contract (`chess.clar`) provides:

- **create-game**: Create a new chess game between two players
- **make-move**: Make a move in an active game (enforces turn-based play)
- **end-game**: End a game and declare a winner
- **get-game**: Read game state
- **get-game-count**: Get total number of games created

### Contract Features

- Turn-based gameplay enforcement
- Game state tracking (active/finished)
- Move history storage (up to 200 moves)
- Winner declaration

## Deployment

### Local Development (Simnet)

The contract is already validated and ready to use on Simnet:

```bash
# Check contract syntax
clarinet check

# Open interactive console
clarinet console

# In console, create a game:
(contract-call? .chess create-game 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)

# Make a move (white's turn):
(contract-call? .chess make-move u1 "e2e4")

# Get game state:
(contract-call? .chess get-game u1)
```

### Deploy to Testnet

1. Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet

2. Update `settings/Testnet.toml` with your mnemonic

3. Deploy:
```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Deploy to Mainnet

1. Update `settings/Mainnet.toml` with your mnemonic

2. Ensure you have enough STX for deployment fees

3. Deploy:
```bash
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## Next Steps

1. ✅ Smart contract created and validated
2. 🔄 Build Next.js frontend with Tailwind CSS
3. 🔄 Integrate Stacks.js for wallet connection
4. 🔄 Implement chess UI and game logic
5. 🔄 Connect frontend to smart contract

## Testing

Run contract tests:
```bash
npm install
npm test
```

## Requirements

- Clarinet 3.x
- Node.js 18+
- Stacks wallet (Hiro Wallet or Leather)

## Resources

- [Clarity Documentation](https://docs.stacks.co/clarity)
- [Stacks.js](https://github.com/hirosystems/stacks.js)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
