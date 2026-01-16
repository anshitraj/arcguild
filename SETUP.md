# Setup Guide

This guide will help you set up ArcGuilds for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 ([Install](https://pnpm.io/installation))
- **Docker** and **Docker Compose** ([Install](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/))

## Step 1: Clone the Repository

```bash
git clone https://github.com/anshitraj/arcguild.git
cd arcguild
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo workspace.

## Step 3: Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arcguilds"

# Arc Testnet
ARC_RPC_URL="https://rpc.testnet.arc.network"
ARC_CHAIN_ID=5042002

# WalletConnect (Required for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id-here"
# Get your project ID from: https://cloud.walletconnect.com/

# Contract Addresses (after deployment)
GUILD_REGISTRY_ADDRESS=""
SEASON_ENGINE_ADDRESS=""
BADGE_FACTORY_ADDRESS=""
XP_SYSTEM_ADDRESS=""
DEPLOYMENT_TRACKER_ADDRESS=""

# Admin
ADMIN_PRIVATE_KEY="your-admin-private-key"

# JWT
JWT_SECRET="your-jwt-secret"
```

## Step 4: Start Infrastructure

Start PostgreSQL and other services using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

## Step 5: Database Setup

Run migrations and seed the database:

```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma db seed
```

## Step 6: Deploy Contracts (Optional for Development)

If you want to deploy contracts to Arc Testnet:

1. Get testnet USDC from [Circle Faucet](https://faucet.circle.com)
2. Fund your deployment wallet
3. Deploy contracts:

```bash
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network arc-testnet
```

4. Copy the deployed contract addresses to your `.env` file

## Step 7: Start Development Servers

Start all development servers:

```bash
pnpm dev
```

This will start:
- Web app: http://localhost:3000
- Admin dashboard: http://localhost:3001

## Step 8: Connect Your Wallet

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select your preferred wallet (MetaMask, Rainbow, etc.)
4. Connect to Arc Testnet

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in apps/web/package.json
```

### Database Connection Issues

Ensure Docker is running and the database container is up:

```bash
docker-compose ps
docker-compose logs postgres
```

### Module Not Found Errors

Clear cache and reinstall:

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Wallet Connection Issues

- Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env`
- Check that your wallet is connected to Arc Testnet
- Verify the RPC URL is correct

## Next Steps

- Read the [README.md](./README.md) for feature overview
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Explore the codebase structure

## Getting Help

- Open an issue on GitHub
- Check existing issues and discussions
- Review the documentation

---

Happy coding! 🚀
