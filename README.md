# ArcGuilds - Contribution & Gamification Platform

A comprehensive platform for Arc Network where users join guilds, complete missions, deploy contracts, and earn badges. Skills and contributions are provably recorded onchain.

## 🎯 Vision

ArcGuilds is NOT a guild.xyz clone. It's a **programmable guild + skill + deployment engine** that combines:

- **Guild System**: Projects create guilds with time-boxed seasons
- **Mission Engine**: Onchain + offchain task verification
- **Badge Studio**: Custom SBT/NFT creation with mint conditions
- **Deployment Arena**: Deploy real contracts and earn XP (KEY DIFFERENTIATOR)
- **Gamification**: XP, levels, skills, reputation, streaks

## 🏗️ Architecture

```
arcguilds-platform/
├── apps/
│   ├── web/              # Player & Guild Leader UI
│   ├── admin/            # Admin Dashboard
│   └── indexer/          # Event Indexer & Scorer
├── packages/
│   ├── contracts/        # Solidity Contracts
│   ├── database/         # Prisma Schema
│   ├── sdk/              # TypeScript SDK
│   └── ui/               # Shared Components
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose
- Web3 wallet (MetaMask, Rainbow, WalletConnect, etc.)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

### 3. Setup Database

```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma db seed
```

### 4. Deploy Contracts

```bash
# Get testnet USDC from https://faucet.circle.com
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network arc-testnet
# Copy contract addresses to .env
```

### 5. Start Development

```bash
pnpm dev
# Web: http://localhost:3000
# Admin: http://localhost:3001
```

## 🎮 Core Features

### 1. Guilds & Seasons
- Any project/user can create a guild
- Time-boxed seasons (4-6 weeks)
- Points reset per season
- Lifetime reputation persists

### 2. Mission Engine
**Mission Types:**
- `ONCHAIN_ACTION`: Tx count, contract interaction, volume, deployment
- `OFFCHAIN_PROOF`: Image, QR, link, text submission
- `ADMIN_APPROVED`: Manual verification

**Each Mission:**
- XP rewards
- Guild score contribution
- Caps & cooldowns
- Eligibility rules (level, reputation, skill class)

### 3. Badge Studio (Guild.xyz++)
Guild owners can:
- Upload badge images
- Define metadata
- Choose SBT or NFT
- Set mint conditions:
  - Mission completion
  - Rank achieved
  - Contract deployed
  - Admin approval
  - XP/reputation thresholds

### 4. Contract Deployment Arena (KEY FEATURE)
Deploy real contracts on Arc:
- **Templates**: ERC20, ERC721, ERC1155, Multisig, Timelock, Governor
- **Verification**: Onchain deployment tracking
- **Rewards**: XP + badges for deployments
- **Stats**: Track success rate, gas usage, contract addresses

### 5. Gamification System
- **XP & Levels**: Exponential curve, level-gated content
- **Skill Classes**: Builder, Trader, Creator, Community
- **Streaks**: Daily activity tracking with bonuses
- **Reputation**: Anti-sybil score (0-100)
- **Guild Synergy**: Bonuses for guild activity

### 6. Anti-Cheat
- XP caps per day/week
- Duplicate proof detection (image hash, QR, link)
- Contract uniqueness checks
- Reputation-based multipliers
- Admin flagging & penalties

## 📦 Smart Contracts

### GuildRegistry.sol
- Guild creation & management
- Membership & invite codes
- Role management

### SeasonEngine.sol
- Season lifecycle
- Score emissions
- Leaderboards

### BadgeFactory.sol
- Badge type creation
- SBT/NFT minting
- Mint condition verification

### XPSystem.sol
- XP grants & tracking
- Level calculations
- Reputation management

### DeploymentTracker.sol
- Contract deployment registration
- Verification tracking
- Deployment stats

## 🗄️ Database Schema

**Core Tables:**
- `User`: Address, XP, level, reputation, stats
- `Guild`: Handle, name, settings, metadata
- `GuildMember`: Role, skill class, guild XP
- `Season`: Time-boxed competitions per guild
- `MissionTemplate`: Reusable mission definitions
- `MissionProgress`: User progress tracking
- `ProofSubmission`: Offchain proof review queue
- `BadgeTemplate`: Badge definitions with mint conditions
- `UserBadge`: Minted badges with proof data
- `ContractDeployment`: Deployment tracking
- `XPTransaction`: XP history & audit trail
- `OnchainEvent`: Indexed blockchain events

## 🎨 UI/UX

**Design Principles:**
- Dark theme, clean minimal aesthetic
- Space Grotesk font (no defaults)
- Mobile-first responsive
- Fast navigation & search
- Real-time updates
- Empty states & loading skeletons

**Key Pages:**
- `/` - Home with stats, featured guilds, missions
- `/guilds` - Browse & search guilds
- `/guilds/[handle]` - Guild profile & seasons
- `/missions` - Active missions
- `/deploy` - Contract deployment arena
- `/badges` - Badge gallery
- `/leaderboard` - Rankings
- `/profile/[address]` - User profile

## 🔧 Development

### Wallet Integration

ArcGuilds uses **Rainbow Wallet Kit** for wallet connections, providing support for:
- MetaMask
- Rainbow Wallet
- WalletConnect
- Coinbase Wallet
- And 50+ other wallets

The wallet connection is handled via RainbowKit's `ConnectButton` component, which provides a beautiful, accessible UI for connecting wallets.

### Run Tests

```bash
cd packages/contracts
pnpm test
```

### Database Management

```bash
cd packages/database
pnpm prisma studio
pnpm prisma migrate dev --name migration_name
```

### Contract Deployment

```bash
cd packages/contracts
pnpm compile
pnpm deploy
```

## 🌐 Environment Variables

See `.env.example` for all required variables:
- Database connection
- Arc Testnet RPC & Chain ID
- Contract addresses
- Admin wallet private key
- JWT secrets
- Storage configuration
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)

## 📊 Analytics

Track:
- DAU/WAU metrics
- Mission completion rates
- Deployment success rates
- Guild growth
- User retention
- XP distribution

## 🎯 Roadmap

- [x] Core infrastructure
- [x] Guild & season system
- [x] Mission engine
- [x] Badge studio
- [x] Deployment arena
- [ ] API routes
- [ ] Indexer service
- [ ] Admin dashboard
- [ ] Mobile app
- [ ] Cross-chain support

---

Built with ❤️ for Arc Network
