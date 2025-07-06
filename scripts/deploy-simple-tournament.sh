#!/bin/bash

echo "Deploying Simple Tournament Contract with Minute-based Durations..."

# Navigate to the contract directory
cd /Users/cyber/Downloads/rival/Contract/rivals_tournament

# Build the contract
echo "Building contract..."
sui move build

# Deploy to mainnet
echo "Deploying to mainnet..."
sui client publish --gas-budget 100000000

echo "Deployment complete!"
echo "Please update the NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID in your .env.local with the new package ID"