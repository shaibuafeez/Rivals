# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rivals is a decentralized NFT battle platform on Sui blockchain featuring:
- **Frontend**: Next.js 15 (App Router) with TypeScript, Tailwind CSS, DaisyUI
- **Smart Contracts**: Sui Move (2024.beta) for tournament management
- **Storage**: Walrus integration for off-chain NFT storage
- **Wallet Support**: @mysten/dapp-kit and @suiet/wallet-kit

## Design System

### Visual Hierarchy
- **Headers**: Uppercase with tight tracking for aggressive tournament aesthetic
- **Body Text**: Normal case for readability (using `normal-case` class)
- **Button Text**: Uppercase with wide tracking
- **Contrast**: Minimum text-gray-400 on dark backgrounds (WCAG AA compliance)
- **Type Scale**: 
  - Display: text-6xl/7xl for hero sections
  - Headings: text-3xl/4xl for section titles
  - Subheadings: text-xl/2xl for card titles
  - Body: text-sm/base for descriptions
  - Labels: text-xs uppercase for metadata

### Color System
Located in `/src/styles/tournament-colors.css`:
- **Daily Tournaments**: Green accent (hsl(120, 35%, 50%))
- **Weekly Tournaments**: Blue accent (hsl(210, 40%, 55%))
- **Monthly Tournaments**: Gold accent (hsl(45, 45%, 55%))
- **Special Tournaments**: Purple accent (hsl(270, 35%, 55%))
- **Backgrounds**: 
  - Primary: #0a0a0a (main background)
  - Secondary: black (card backgrounds)
  - Elevated: gray-900 (modal surfaces)
- **Accent Colors**:
  - Success: green-500
  - Error: red-500
  - Warning: yellow-500
  - Info: blue-500
  - Focus: purple-500

### Animations & Micro-interactions
Located in `/src/styles/animations.css`:
- **Hover Effects**: 
  - `hover-lift`: -4px translateY with shadow
  - `hover-glow`: Subtle white overlay
- **Button Press**: 
  - `button-press`: scale(0.97) on active
  - `button-feedback`: Ripple effect
- **NFT Selection**: 
  - `nft-select-feedback`: Ripple animation on click
  - `selected`: Border highlight with shadow
- **Success States**: 
  - `success-animation`: Scale spring animation
  - Confetti for tournament victories
- **Card Entrance**: 
  - `card-appear`: Fade up with stagger
  - Motion blur on fast transitions
- **Loading States**: 
  - `skeleton-loading`: Shimmer effect
  - Progress indicators with percentage

### Tournament Type Visual Language
- **Indicators**: Pulsing dots with color-coded states
  - Daily: Green with 2s pulse
  - Weekly: Blue with 3s pulse  
  - Monthly: Gold with 4s pulse
  - Active: Additional pulse ring
- **Card Borders**: Left accent based on type
- **Badge Colors**: Matching tournament type colors

### Accessibility
Located in `/src/styles/focus.css`:
- **Focus Indicators**: 2px purple-500 outline with 2px offset
- **Keyboard Navigation**: Full support with visible focus states
- **Motion Preferences**: 
  - Respects `prefers-reduced-motion`
  - Fallback to instant transitions
- **Color Contrast**: 
  - All text meets WCAG AA standards
  - Gray-400 minimum on black backgrounds
  - White on colored backgrounds
- **Screen Reader Support**: Proper ARIA labels and roles

### Component Patterns

#### Tournament Cards
- Left border accent matching tournament type
- Hover lift animation with shadow
- Progress bar for player capacity
- Geometric corner accents on featured cards
- Type-specific CSS classes: `tournament-card-[type]`

#### Entry Modals
- **TournamentEntryModal**: Dark theme with steps
- **ImprovedTournamentEntryModal**: Side-by-side layout
  - Left: NFT grid selection
  - Right: Preview and confirmation
  - Progress indication during submission

#### Status Indicators
- Pulsing dots with tournament-specific timing
- Position: Top-right of cards
- Colors match tournament type system
- Active tournaments have additional animation

#### Victory Celebrations
- **VictoryCelebration** component with:
  - Confetti animation (canvas-confetti)
  - Trophy emoji animation
  - Prize display with gradient background
  - Achievement unlocks for first-time winners
  - Rank-specific celebrations (1st, 2nd, 3rd)

#### Information Architecture
- Clear visual hierarchy in modals
- Side-by-side layouts for complex data
- Progressive disclosure for tournament details
- Contextual help text in blue info boxes

### Gamification Elements
- **Achievement System**: 
  - Visual badges for milestones
  - Toast notifications for unlocks
  - Progress tracking in localStorage
- **Victory Animations**:
  - Rank-specific confetti colors
  - Spring animations for trophies
  - Social sharing integration
- **Progress Indicators**:
  - Real-time capacity bars
  - Animated stat counters
  - Visual feedback for all actions

### Dark Theme Implementation
- **Backgrounds**: 
  - Main: bg-[#0a0a0a]
  - Cards: bg-black
  - Modals: bg-[#0a0a0a] with border
  - Overlays: bg-black/80 with backdrop-blur
- **Borders**: 
  - Default: border-gray-800
  - Hover: border-gray-700 or border-gray-600
  - Active: border-white or accent color
- **Text Hierarchy**:
  - Primary: text-white
  - Secondary: text-gray-300
  - Tertiary: text-gray-400
  - Disabled: text-gray-600

## Essential Commands

```bash
# Frontend Development
npm run dev                    # Start development server (localhost:3000)
npm run build                  # Build production app
npm run lint                   # Run ESLint
npm run create-tournament      # Create test tournament via script

# Smart Contract Development (in Contract/rivals_tournament/)
sui move build                 # Build Move contracts
sui move test                  # Run all contract tests
sui move test <test_name>      # Run specific test
sui client publish --gas-budget 100000000  # Deploy contracts

# Utility Scripts (from project root)
node scripts/fetch-tournaments.js         # Fetch all tournaments
node scripts/inspect-registry.js          # Inspect tournament registry
node scripts/create-azur-tournament.js    # Create Azur Guardian exclusive tournament
node scripts/verify-tournament-registry.js # Verify registry deployment
```

## Architecture & Patterns

### Frontend Structure
- **App Router**: Next.js 15 app directory with client-heavy components (most components use 'use client')
- **Services Layer**: Abstraction for blockchain operations
  - `tournamentService.ts`: Tournament CRUD, entry, voting operations
  - `nftService.ts`: NFT fetching and management
  - `walrusService.ts`: Off-chain storage integration
  - `azurGuardianService.ts`: Azur Guardian NFT specific functionality
- **Custom Hooks**: 
  - `useWallet`: Wallet connection state management
  - `useTournaments`: Tournament data fetching with caching
  - `useNetworkInfo`: Network status monitoring
- **Error Handling**: Custom error mapping in `errorMapping.ts`, retry logic with exponential backoff
- **Dynamic Imports**: Wallet libraries loaded dynamically to avoid SSR issues

### Smart Contract Architecture
Located in `/Contract/rivals_tournament/sources/`:
- `tournament.move`: Core tournament logic, prize distribution, state management
- `tournament_entry.move`: NFT entry tracking and validation
- `nft_manager.move`: NFT registration, type validation, collection management  
- `user_reputation.move`: Reputation and staking system
- `storage.move`: Data structures and utilities
- `scripts.move`: Entry functions for easier interaction

### Tournament System
- **Types**: Daily (1 point, 24h), Weekly (3 points, 168h), Monthly (5 points, 720h)
- **Prize Distribution**: 
  - 5+ participants: 60% first, 30% second, 10% third
  - <5 participants: Full refund to all
- **Entry Fee**: 1 SUI per NFT
- **Token Gating**: Optional restriction to specific NFT collections
- **Azur Guardian Exclusive**: Special tournaments for Azur Guardian NFTs only

### Contract Testing
Test files in `/Contract/rivals_tournament/tests/`:
- `basic_tournament_test.move`: Core tournament operations
- `prize_distribution_tests.move`: Prize distribution logic
- `storage_tests.move`: Data structure tests
- `rivals_tournament_tests.move`: Integration tests

## Environment Configuration

Required `.env.local`:
```bash
# Sui Configuration
NEXT_PUBLIC_TOURNAMENT_PACKAGE_ID=0x...
NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID=0x...
NEXT_PUBLIC_NETWORK=testnet                 # testnet|mainnet|devnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Walrus Storage
NEXT_PUBLIC_WALRUS_API_ENDPOINT=https://api.walrus.sui.io
NEXT_PUBLIC_WALRUS_API_KEY=your_api_key_here  # Optional

# Development
PRIVATE_KEY=0x...                          # For script operations
NEXT_PUBLIC_USE_MOCK_DATA=false            # Enable mock mode
```

## Key Implementation Details

### Transaction Patterns
- All blockchain calls wrapped in retry logic (3 attempts, exponential backoff)
- Transaction blocks built using `TransactionBlock` from @mysten/sui.js
- Error codes mapped to user-friendly messages in `errorMapping.ts`

### NFT Validation
- Azur Guardian NFTs validated by type string comparison
- Type string: `0xfc9d0c6972cae3f303030b993485af37e2d86ebf3b409d1e6a40cde955a43a77::azur_guardians::Nft`
- Custom error code `ENFTNotAzurGuardian` (15) for validation failures

### State Management
- **Zustand**: Global state for wallet, UI preferences
- **TanStack Query**: Data fetching, caching (5 minute cache for tournaments)
- **Local Storage**: Tournament registry cache to reduce RPC calls

### UI Components
- **Tournament Cards**: `ModernTournamentCard` for grid display
- **NFT Selection**: `NFTSelectionModal` with collection support
- **Transaction Status**: `TransactionStatus` component for real-time updates
- **Error Boundaries**: Graceful error handling throughout

## Common Development Tasks

### Adding New Tournament Type
1. Update `tournament.move` with new type constant
2. Add type to `TournamentType` enum in frontend
3. Update prize distribution logic if needed
4. Add new type to tournament creation forms
5. Add color scheme to `/src/styles/tournament-colors.css`

### Debugging Smart Contract Errors
1. Check error code in `tournament.move` constants
2. Map error in `errorMapping.ts` for frontend display
3. Use `sui move test -f <test_name>` for isolated testing
4. Inspect events with `scripts/inspect-registry.js`

### Working with Walrus Storage
1. Upload images using `walrusService.uploadImage()`
2. Store returned blob ID in tournament entry
3. Retrieve with `walrusService.getImageUrl(blobId)`
4. Handle fallbacks for missing images

## UI/UX Best Practices

### Typography Guidelines
- Headers: Bold, uppercase, tracking-tight or tracking-wider
- Body: Normal case for readability, text-sm or text-base
- Buttons: Bold, uppercase, tracking-wider
- Labels: Uppercase, tracking-wider, text-xs

### Spacing Principles
- Use 8-point grid system (space-1 through space-10)
- Consistent padding: p-4, p-6, p-8
- Card spacing: gap-4 or gap-6 between cards
- Section margins: mb-8 or mb-12

### Interactive Elements
- All buttons should have `button-press` class
- Cards should have `hover-lift` class
- NFT selections use `nft-select-feedback` class
- Loading states use `skeleton-loading` class

### Dark Theme Considerations
- Background: bg-[#0a0a0a] (not pure black)
- Surface elevation: bg-gray-900 or bg-black
- Borders: border-gray-800 (hover: border-gray-700)
- Text hierarchy: text-white > text-gray-300 > text-gray-400

### Tournament Status Visual Language
- Active: Green indicator with pulse animation
- Upcoming: Blue indicator
- Ended: Gray indicator
- Registration: Yellow indicator

### Success/Error Patterns
- Success: Green-500 with checkmark icon
- Error: Red-500 with X icon
- Warning: Yellow-500 with exclamation
- Info: Blue-500 with info icon

### Modal Design
- Dark overlay: bg-black/80 backdrop-blur-md
- Sharp corners for aggressive aesthetic
- Clear visual hierarchy with proper spacing
- Side-by-side layout for complex forms (desktop)