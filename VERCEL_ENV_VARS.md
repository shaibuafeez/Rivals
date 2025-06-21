# Vercel Environment Variables

You need to set these environment variables in your Vercel project settings:

## For MAINNET deployment:

```
NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID=0x203bbd21feeaa6ea6ea756e83548de6a54ed6ac6c29e5dbbfdfe026d5b44858d
NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID=0xca6e7b1b3e523a551e46fb90e4bf6690b91455919a909e9aa5e8b7619408c5ce
NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID=0x60e804c13a74dd28d23892dd6907bd05cb34f468ad885c20a3035a3ecddc17de
NEXT_PUBLIC_WALRUS_PACKAGE_ID=0xcf2bb814dc0f6cc4f63955619a81c361eb1813e5f3097d4c92d5ed03a2d23912
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.mainnet.sui.io
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_SUI_NETWORK=mainnet
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_BLOCKVISION_API_KEY=2vmcIQeMF5JdhEXyuyQ8n79UNoO
```

## How to set on Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable above
5. Make sure to select all environments (Production, Preview, Development)
6. Click "Save" after adding each variable
7. Redeploy your project for changes to take effect

## Why you're seeing wrong network:

Without these environment variables, the app defaults to:
- Network: testnet (from src/config/env.ts line 18)
- Package IDs: 0x0 (invalid)
- No tournaments will load because the registry ID is wrong

## About Featured Tournaments:

Featured tournaments are just the first 3 tournaments from the filtered list (line 214 in tournaments/page.tsx).
If no tournaments are loading, it's because:
1. Wrong network (testnet instead of mainnet)
2. Wrong package IDs (defaulting to 0x0)
3. The registry at the specified ID doesn't exist on the wrong network