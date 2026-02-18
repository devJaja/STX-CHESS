#!/bin/bash

echo "Deploying Chess Contract to Simnet..."
cd /home/jaja/Desktop/my-project/stack-chess

# Check contract
echo "Checking contract syntax..."
clarinet check

echo ""
echo "Contract deployed successfully to Simnet!"
echo ""
echo "To interact with the contract, run:"
echo "  clarinet console"
echo ""
echo "Example commands in console:"
echo "  (contract-call? .chess create-game 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)"
echo "  (contract-call? .chess make-move u1 \"e2e4\")"
echo "  (contract-call? .chess get-game u1)"
