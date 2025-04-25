# Rivals - NFT Battle Platform on Sui

Rivals is a decentralized NFT battle platform built on the Sui blockchain. The platform allows users to register their NFTs for tournaments, participate in voting, and earn rewards.

## Project Structure

### Smart Contract Modules

- **types.move**: Core data structures and utility functions
- **admin.move**: Admin functionality for contract initialization and management
- **nft_registry.move**: NFT registration and management
- **tournament.move**: Tournament creation and management
- **voting.move**: Voting functionality for NFTs in tournaments
- **rewards.move**: Reward distribution for tournament winners

### Key Features

- NFT Registration with 1 SUI entry fee
- Swipe-to-Vote mechanics with points (1 for daily, 3 for weekly, 5 for monthly tournaments)
- Tournament structure (daily, weekly, monthly) with automatic start/end
- Rewards distribution (70% to winner, 30% to platform)
- Point redemption system for voters

## Development

This project uses Sui Move for smart contracts and Next.js for the frontend.

### Building the Smart Contract

```bash
sui move build
```

### Testing

```bash
sui move test
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
