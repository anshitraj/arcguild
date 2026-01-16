import { PrismaClient, MissionType, MissionFrequency, SeasonStatus, SkillClass, BadgeType, MintConditionType, ContractTemplate } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ArcGuilds database...')

  // Create test users
  const alice = await prisma.user.upsert({
    where: { address: '0x1111111111111111111111111111111111111111' },
    update: {},
    create: {
      address: '0x1111111111111111111111111111111111111111',
      xp: 2500,
      level: 5,
      reputation: 100,
      totalMissions: 12,
      totalDeployments: 3,
      currentStreak: 7,
      longestStreak: 14,
    },
  })

  const bob = await prisma.user.upsert({
    where: { address: '0x2222222222222222222222222222222222222222' },
    update: {},
    create: {
      address: '0x2222222222222222222222222222222222222222',
      xp: 1800,
      level: 4,
      reputation: 95,
      totalMissions: 8,
      totalDeployments: 2,
      currentStreak: 3,
      longestStreak: 8,
    },
  })

  console.log('✅ Created test users')

  // Create guilds
  const arcBuilders = await prisma.guild.upsert({
    where: { handle: 'arc-builders' },
    update: {},
    create: {
      handle: 'arc-builders',
      name: 'Arc Builders',
      description: 'Building the future of Arc Network - deploy contracts, ship features, earn badges',
      tags: ['builders', 'defi', 'infrastructure'],
      isPublic: true,
      createdBy: alice.id,
      inviteCode: 'BUILD2025',
      website: 'https://arcbuilders.xyz',
      twitter: '@arcbuilders',
    },
  })

  const arcTraders = await prisma.guild.upsert({
    where: { handle: 'arc-traders' },
    update: {},
    create: {
      handle: 'arc-traders',
      name: 'Arc Traders',
      description: 'Trading and DeFi on Arc - swaps, liquidity, volume challenges',
      tags: ['trading', 'defi', 'liquidity'],
      isPublic: true,
      createdBy: bob.id,
      inviteCode: 'TRADE2025',
      website: 'https://arctraders.xyz',
    },
  })

  console.log('✅ Created guilds')

  // Add guild members
  await prisma.guildMember.upsert({
    where: {
      guildId_userId: {
        guildId: arcBuilders.id,
        userId: alice.id,
      },
    },
    update: {},
    create: {
      guildId: arcBuilders.id,
      userId: alice.id,
      role: 'LEADER',
      skillClass: 'BUILDER',
      guildXP: 2500,
      contributionScore: 850,
    },
  })

  await prisma.guildMember.upsert({
    where: {
      guildId_userId: {
        guildId: arcTraders.id,
        userId: bob.id,
      },
    },
    update: {},
    create: {
      guildId: arcTraders.id,
      userId: bob.id,
      role: 'LEADER',
      skillClass: 'TRADER',
      guildXP: 1800,
      contributionScore: 620,
    },
  })

  console.log('✅ Added guild members')

  // Create seasons
  const season1 = await prisma.season.upsert({
    where: { id: 'season-builders-1' },
    update: {},
    create: {
      id: 'season-builders-1',
      guildId: arcBuilders.id,
      name: 'Genesis Season',
      startAt: new Date('2025-01-01'),
      endAt: new Date('2025-02-15'),
      status: SeasonStatus.ACTIVE,
      config: {
        maxDailyXP: 1000,
        maxWeeklyXP: 5000,
        streakBonus: 50,
      },
    },
  })

  const season2 = await prisma.season.upsert({
    where: { id: 'season-traders-1' },
    update: {},
    create: {
      id: 'season-traders-1',
      guildId: arcTraders.id,
      name: 'Trading Season Alpha',
      startAt: new Date('2025-01-01'),
      endAt: new Date('2025-02-15'),
      status: SeasonStatus.ACTIVE,
      config: {
        maxDailyXP: 1000,
        maxWeeklyXP: 5000,
        volumeMultiplier: 1.5,
      },
    },
  })

  console.log('✅ Created seasons')

  // Create mission templates for Arc Builders
  const missions = [
    {
      id: 'mission-deploy-erc20',
      guildId: arcBuilders.id,
      type: MissionType.ONCHAIN_ACTION,
      title: 'Deploy Your First ERC20 Token',
      description: 'Deploy an ERC20 token contract on Arc Testnet using the Deployment Arena',
      frequency: MissionFrequency.ONCE,
      xpReward: 500,
      guildScore: 250,
      rules: {
        contractType: 'ERC20',
        minGasUsed: 100000,
      },
      caps: {
        perUser: 1,
        perGuild: 50,
      },
    },
    {
      id: 'mission-deploy-nft',
      guildId: arcBuilders.id,
      type: MissionType.ONCHAIN_ACTION,
      title: 'Deploy NFT Collection',
      description: 'Deploy an ERC721 NFT collection on Arc',
      frequency: MissionFrequency.ONCE,
      xpReward: 750,
      guildScore: 375,
      rules: {
        contractType: 'ERC721',
      },
      caps: {
        perUser: 1,
        perGuild: 30,
      },
      minLevel: 3,
    },
    {
      id: 'mission-interact-dapps',
      guildId: arcBuilders.id,
      type: MissionType.ONCHAIN_ACTION,
      title: 'Interact with 5 Unique dApps',
      description: 'Make transactions with at least 5 different smart contracts on Arc',
      frequency: MissionFrequency.WEEKLY,
      xpReward: 200,
      guildScore: 100,
      rules: {
        minUniqueContracts: 5,
        excludeContracts: [],
      },
      caps: {
        perUser: 1,
        perGuild: 20,
        perWeek: 20,
      },
    },
    {
      id: 'mission-ship-pr',
      guildId: arcBuilders.id,
      type: MissionType.OFFCHAIN_PROOF,
      title: 'Ship a Pull Request',
      description: 'Contribute code to an Arc ecosystem project',
      frequency: MissionFrequency.WEEKLY,
      xpReward: 400,
      guildScore: 200,
      rules: {
        requiresLink: true,
        requiresScreenshot: true,
      },
      caps: {
        perUser: 3,
        perGuild: 30,
        perWeek: 15,
      },
    },
    {
      id: 'mission-daily-tx',
      guildId: arcBuilders.id,
      type: MissionType.ONCHAIN_ACTION,
      title: 'Daily Transaction',
      description: 'Make at least one transaction on Arc today',
      frequency: MissionFrequency.DAILY,
      xpReward: 50,
      guildScore: 25,
      rules: {
        minTransactions: 1,
      },
      caps: {
        perUser: 1,
        perGuild: 100,
        perDay: 100,
      },
    },
    {
      id: 'mission-tutorial',
      guildId: arcBuilders.id,
      type: MissionType.OFFCHAIN_PROOF,
      title: 'Create Tutorial',
      description: 'Write and publish a tutorial about building on Arc',
      frequency: MissionFrequency.WEEKLY,
      xpReward: 600,
      guildScore: 300,
      rules: {
        requiresLink: true,
        minWords: 500,
      },
      caps: {
        perUser: 2,
        perGuild: 10,
        perWeek: 5,
      },
      minLevel: 2,
    },
  ]

  for (const mission of missions) {
    await prisma.missionTemplate.upsert({
      where: { id: mission.id },
      update: {},
      create: mission,
    })
  }

  console.log('✅ Created mission templates')

  // Enable missions for season
  for (const mission of missions) {
    await prisma.seasonMission.upsert({
      where: {
        seasonId_missionTemplateId: {
          seasonId: season1.id,
          missionTemplateId: mission.id,
        },
      },
      update: {},
      create: {
        seasonId: season1.id,
        missionTemplateId: mission.id,
        enabled: true,
      },
    })
  }

  console.log('✅ Enabled missions for season')

  // Create badge templates
  const badges = [
    {
      id: 'badge-first-deploy',
      guildId: arcBuilders.id,
      name: 'First Deployment',
      description: 'Deployed your first smart contract on Arc',
      imageUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400',
      badgeType: BadgeType.SBT,
      createdBy: alice.id,
      mintConditions: [
        {
          type: MintConditionType.CONTRACT_DEPLOYED,
          value: 1,
        },
      ],
    },
    {
      id: 'badge-builder-elite',
      guildId: arcBuilders.id,
      name: 'Elite Builder',
      description: 'Reached level 10 and deployed 5+ contracts',
      imageUrl: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400',
      badgeType: BadgeType.SBT,
      createdBy: alice.id,
      mintConditions: [
        {
          type: MintConditionType.XP_THRESHOLD,
          value: 5000,
        },
        {
          type: MintConditionType.CONTRACT_DEPLOYED,
          value: 5,
        },
      ],
    },
    {
      id: 'badge-season-winner',
      guildId: arcBuilders.id,
      name: 'Season Champion',
      description: 'Top 10 contributor in Genesis Season',
      imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
      badgeType: BadgeType.NFT,
      createdBy: alice.id,
      mintConditions: [
        {
          type: MintConditionType.RANK_ACHIEVED,
          value: 10,
        },
      ],
    },
  ]

  for (const badge of badges) {
    await prisma.badgeTemplate.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    })
  }

  console.log('✅ Created badge templates')

  // Create sample contract deployments
  await prisma.contractDeployment.create({
    data: {
      userId: alice.id,
      seasonId: season1.id,
      template: ContractTemplate.ERC20,
      contractName: 'MyToken',
      contractAddress: '0x3333333333333333333333333333333333333333',
      deploymentTx: '0xabc123...',
      status: 'SUCCESS',
      xpAwarded: 500,
      badgeAwarded: true,
      constructorArgs: {
        name: 'MyToken',
        symbol: 'MTK',
        initialSupply: '1000000',
      },
    },
  })

  console.log('✅ Created sample deployments')

  // Create XP transactions
  await prisma.xPTransaction.create({
    data: {
      userId: alice.id,
      amount: 500,
      source: 'CONTRACT_DEPLOY',
      description: 'Deployed ERC20 token',
      metadata: {
        contractAddress: '0x3333333333333333333333333333333333333333',
      },
    },
  })

  console.log('✅ Created XP transactions')

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
