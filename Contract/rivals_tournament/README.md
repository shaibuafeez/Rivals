# Rivals Tournament Smart Contract

This repository contains the Sui Move smart contract for the Rivals NFT tournament platform. The contract enables users to participate in NFT tournaments, vote for their favorite NFTs, and win rewards.

## Features

- **Tournament Management**: Create and manage daily, weekly, and monthly tournaments
- **NFT Integration**: Register NFTs to tournaments and track their performance
- **Voting System**: Vote for favorite NFTs in tournaments
- **Reputation System**: Track user reputation and participation history
- **Staking Mechanism**: Stake SUI to increase voting power
- **Prize Distribution**: Automatically distribute prizes to tournament winners

## Project Structure

- `sources/tournament.move`: Core tournament functionality
- `sources/nft_manager.move`: NFT integration and management
- `sources/user_reputation.move`: User reputation and staking system
- `tests/tournament_tests.move`: Unit tests for the smart contract

## Getting Started

### Prerequisites

- Sui CLI installed
- Access to Sui network (devnet, testnet, or mainnet)

### Building the Contract

```bash
cd rivals_tournament
sui move build
```

### Testing the Contract

```bash
sui move test
```

### Deploying the Contract

```bash
sui client publish --gas-budget 100000000
```

## Contract Usage

### Creating a Tournament

```move
// Initialize tournament registry
tournament::init(ctx);

// Create a tournament
tournament::create_tournament(
    registry,
    name,
    description,
    tournament_type,
    duration_hours,
    entry_fee,
    initial_prize,
    clock,
    ctx
);
```

### Registering an NFT

```move
// Mint an NFT
let nft = nft_manager::mint(name, description, url_string, ctx);

// Register NFT to tournament
tournament::register_nft(
    tournament,
    nft_id,
    entry_fee_payment,
    clock,
    ctx
);
```

### Voting for an NFT

```move
// Vote for an NFT
tournament::vote_for_nft(
    tournament,
    nft_id,
    clock,
    ctx
);
```

### Ending a Tournament

```move
// End tournament and distribute prizes
tournament::end_tournament(
    registry,
    tournament,
    clock,
    ctx
);
```

## Integration with Frontend

The smart contract is designed to work seamlessly with the Rivals frontend application. The frontend can interact with the contract through the following events:

- `TournamentCreatedEvent`
- `NFTRegisteredEvent`
- `VoteCastEvent`
- `TournamentEndedEvent`
- `NFTMintedEvent`
- `UserProfileCreatedEvent`

## License

This project is licensed under the MIT License.
