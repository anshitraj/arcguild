import { config } from 'dotenv'
import { resolve } from 'path'
import { ethers } from 'ethers'
import { prisma } from '@arcguilds/database'

// Load .env from root directory (3 levels up: src -> indexer -> apps -> root)
config({ path: resolve(__dirname, '../../../.env') })

const RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const CONTRACT_ADDRESSES = {
  xpSystem: process.env.XP_SYSTEM_ADDRESS || '',
  deploymentTracker: process.env.DEPLOYMENT_TRACKER_ADDRESS || '',
  guildRegistry: process.env.GUILD_REGISTRY_ADDRESS || '',
  seasonEngine: process.env.SEASON_ENGINE_ADDRESS || '',
}

// ABI fragments for events we care about
const XP_SYSTEM_ABI = [
  'event XPGranted(address indexed user, uint256 amount, string reason)',
  'event LevelUp(address indexed user, uint256 newLevel)',
  'event ReputationChanged(address indexed user, uint256 newReputation)',
]

const DEPLOYMENT_TRACKER_ABI = [
  'event ContractDeployed(address indexed deployer, address indexed contractAddress, uint8 template, uint256 timestamp)',
  'event ContractVerified(address indexed contractAddress)',
]

const GUILD_REGISTRY_ABI = [
  'event GuildCreated(uint256 indexed guildId, string handle, address indexed creator, string metadataURI)',
  'event MemberJoined(uint256 indexed guildId, address indexed member, bytes32 inviteCode)',
  'event MemberLeft(uint256 indexed guildId, address indexed member)',
]

const SEASON_ENGINE_ABI = [
  'event SeasonCreated(uint256 indexed seasonId, string name, uint256 startTime, uint256 endTime)',
  'event ScoreEmitted(uint256 indexed seasonId, uint256 indexed guildId, address indexed user, uint256 guildPoints, uint256 individualPoints, string reason)',
]

let provider: ethers.Provider
let lastProcessedBlock: number = 0

async function getLastProcessedBlock(): Promise<number> {
  const lastEvent = await prisma.onchainEvent.findFirst({
    orderBy: { blockNumber: 'desc' },
    select: { blockNumber: true },
  })
  return lastEvent?.blockNumber || 0
}

async function processBlock(blockNumber: number) {
  try {
    const block = await provider.getBlock(blockNumber, true)
    if (!block) return

    // Process transactions in block
    for (const tx of block.transactions) {
      if (typeof tx === 'string') continue

      const receipt = await provider.getTransactionReceipt(tx.hash)
      if (!receipt) continue

      // Process logs
      for (const log of receipt.logs) {
        await processLog(log, receipt.blockNumber)
      }
    }
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error)
  }
}

async function processLog(log: ethers.Log, blockNumber: number) {
  try {
    // Check if already processed
    const existing = await prisma.onchainEvent.findUnique({
      where: {
        txHash_logIndex: {
          txHash: log.transactionHash,
          logIndex: log.index,
        },
      },
    })

    if (existing) return

    // Store event
    await prisma.onchainEvent.create({
      data: {
        chainId: Number(log.chainId),
        txHash: log.transactionHash,
        logIndex: log.index,
        blockNumber,
        eventName: 'Unknown',
        contract: log.address,
        userAddress: log.topics[1] ? ethers.getAddress('0x' + log.topics[1].slice(-40)) : '',
        parsed: {},
        timestamp: new Date(),
        processed: false,
      },
    })

    // Try to decode and process known events
    await decodeAndProcessEvent(log, blockNumber)
  } catch (error) {
    console.error('Error processing log:', error)
  }
}

async function decodeAndProcessEvent(log: ethers.Log, blockNumber: number) {
  try {
    // XP System events
    if (log.address.toLowerCase() === CONTRACT_ADDRESSES.xpSystem.toLowerCase()) {
      const iface = new ethers.Interface(XP_SYSTEM_ABI)
      const decoded = iface.parseLog({
        topics: log.topics,
        data: log.data,
      })

      if (decoded) {
        if (decoded.name === 'XPGranted') {
          const user = decoded.args.user as string
          const amount = decoded.args.amount as bigint
          const reason = decoded.args.reason as string

          await updateUserXP(user, Number(amount), reason, log.transactionHash)
        } else if (decoded.name === 'LevelUp') {
          const user = decoded.args.user as string
          const newLevel = decoded.args.newLevel as bigint

          await updateUserLevel(user, Number(newLevel))
        } else if (decoded.name === 'ReputationChanged') {
          const user = decoded.args.user as string
          const newReputation = decoded.args.newReputation as bigint

          await updateUserReputation(user, Number(newReputation))
        }
      }
    }

    // Deployment Tracker events
    if (log.address.toLowerCase() === CONTRACT_ADDRESSES.deploymentTracker.toLowerCase()) {
      const iface = new ethers.Interface(DEPLOYMENT_TRACKER_ABI)
      const decoded = iface.parseLog({
        topics: log.topics,
        data: log.data,
      })

      if (decoded && decoded.name === 'ContractDeployed') {
        const deployer = decoded.args.deployer as string
        const contractAddress = decoded.args.contractAddress as string
        const template = decoded.args.template as number

        await processDeployment(deployer, contractAddress, template, log.transactionHash)
      }
    }

    // Mark as processed
    await prisma.onchainEvent.updateMany({
      where: {
        txHash: log.transactionHash,
        logIndex: log.index,
      },
      data: { processed: true },
    })
  } catch (error) {
    // Event might not match our ABIs, that's okay
    console.debug('Could not decode event:', error)
  }
}

async function updateUserXP(
  address: string,
  amount: number,
  reason: string,
  txHash: string
) {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
  })

  if (!user) {
    // Create user if doesn't exist
    await prisma.user.create({
      data: {
        address: address.toLowerCase(),
        xp: amount,
      },
    })
  } else {
    // Calculate new level
    const newXP = user.xp + amount
    const newLevel = calculateLevel(newXP)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: newXP,
        level: newLevel,
      },
    })

    // Record XP transaction
    await prisma.xPTransaction.create({
      data: {
        userId: user.id,
        amount,
        source: 'MISSION_COMPLETE', // Could be more specific based on reason
        description: reason,
        metadata: { txHash },
      },
    })
  }
}

async function updateUserLevel(address: string, level: number) {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { level },
    })
  }
}

async function updateUserReputation(address: string, reputation: number) {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { reputation },
    })
  }
}

async function processDeployment(
  deployer: string,
  contractAddress: string,
  template: number,
  txHash: string
) {
  const user = await prisma.user.findUnique({
    where: { address: deployer.toLowerCase() },
  })

  if (!user) return

  // Check if deployment already exists
  const existing = await prisma.contractDeployment.findFirst({
    where: {
      contractAddress: contractAddress.toLowerCase(),
      deploymentTx: txHash,
    },
  })

  if (existing) return

  // Create deployment record
  await prisma.contractDeployment.create({
    data: {
      userId: user.id,
      template: getTemplateName(template),
      contractName: `Contract ${contractAddress.slice(0, 8)}`,
      contractAddress: contractAddress.toLowerCase(),
      deploymentTx: txHash,
      status: 'SUCCESS',
      xpAwarded: 100, // Base XP for deployment
    },
  })

  // Award XP
  await updateUserXP(deployer, 100, `Contract deployment: ${contractAddress}`, txHash)

  // Update user stats
  await prisma.user.update({
    where: { id: user.id },
    data: {
      totalDeployments: { increment: 1 },
    },
  })
}

function getTemplateName(template: number): string {
  const templates = ['ERC20', 'ERC721', 'ERC1155', 'MULTISIG', 'TIMELOCK', 'GOVERNOR', 'CUSTOM']
  return templates[template] || 'CUSTOM'
}

function calculateLevel(xp: number): number {
  if (xp < 100) return 1
  if (xp < 300) return 2
  if (xp < 600) return 3
  if (xp < 1000) return 4
  if (xp < 1500) return 5
  if (xp < 2100) return 6
  if (xp < 2800) return 7
  if (xp < 3600) return 8
  if (xp < 4500) return 9
  if (xp < 5500) return 10

  // After level 10, 1000 XP per level
  return 10 + Math.floor((xp - 5500) / 1000)
}

async function indexBlocks() {
  try {
    const currentBlock = await provider.getBlockNumber()
    const startBlock = lastProcessedBlock + 1

    if (startBlock > currentBlock) {
      console.log('No new blocks to process')
      return
    }

    console.log(`Processing blocks ${startBlock} to ${currentBlock}`)

    // Process in batches
    const batchSize = 100
    for (let i = startBlock; i <= currentBlock; i += batchSize) {
      const endBlock = Math.min(i + batchSize - 1, currentBlock)
      console.log(`Processing blocks ${i} to ${endBlock}`)

      for (let blockNum = i; blockNum <= endBlock; blockNum++) {
        await processBlock(blockNum)
      }

      lastProcessedBlock = endBlock
    }

    console.log(`Indexed up to block ${currentBlock}`)
  } catch (error) {
    console.error('Indexing error:', error)
  }
}

async function main() {
  console.log('Starting indexer service...')
  console.log('RPC URL:', RPC_URL)
  console.log('Contract addresses:', CONTRACT_ADDRESSES)

  provider = new ethers.JsonRpcProvider(RPC_URL)

  // Get last processed block
  lastProcessedBlock = await getLastProcessedBlock()
  console.log(`Starting from block ${lastProcessedBlock}`)

  // Index every 10 seconds
  setInterval(async () => {
    await indexBlocks()
  }, 10000)

  // Initial index
  await indexBlocks()
}

main().catch(console.error)
