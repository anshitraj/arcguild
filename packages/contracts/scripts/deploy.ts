import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ArcGuilds contracts to Arc Testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GuildRegistry
  console.log("\n📜 Deploying GuildRegistry...");
  const GuildRegistry = await ethers.getContractFactory("GuildRegistry");
  const guildRegistry = await GuildRegistry.deploy();
  await guildRegistry.waitForDeployment();
  const guildRegistryAddress = await guildRegistry.getAddress();
  console.log("✅ GuildRegistry deployed to:", guildRegistryAddress);

  // Deploy SeasonEngine
  console.log("\n📜 Deploying SeasonEngine...");
  const SeasonEngine = await ethers.getContractFactory("SeasonEngine");
  const seasonEngine = await SeasonEngine.deploy();
  await seasonEngine.waitForDeployment();
  const seasonEngineAddress = await seasonEngine.getAddress();
  console.log("✅ SeasonEngine deployed to:", seasonEngineAddress);

  // Deploy BadgeFactory
  console.log("\n📜 Deploying BadgeFactory...");
  const BadgeFactory = await ethers.getContractFactory("BadgeFactory");
  const badgeFactory = await BadgeFactory.deploy();
  await badgeFactory.waitForDeployment();
  const badgeFactoryAddress = await badgeFactory.getAddress();
  console.log("✅ BadgeFactory deployed to:", badgeFactoryAddress);

  // Deploy XPSystem
  console.log("\n📜 Deploying XPSystem...");
  const XPSystem = await ethers.getContractFactory("XPSystem");
  const xpSystem = await XPSystem.deploy();
  await xpSystem.waitForDeployment();
  const xpSystemAddress = await xpSystem.getAddress();
  console.log("✅ XPSystem deployed to:", xpSystemAddress);

  // Deploy DeploymentTracker
  console.log("\n📜 Deploying DeploymentTracker...");
  const DeploymentTracker = await ethers.getContractFactory("DeploymentTracker");
  const deploymentTracker = await DeploymentTracker.deploy();
  await deploymentTracker.waitForDeployment();
  const deploymentTrackerAddress = await deploymentTracker.getAddress();
  console.log("✅ DeploymentTracker deployed to:", deploymentTrackerAddress);

  // Grant roles
  console.log("\n🔐 Setting up roles...");
  
  await seasonEngine.grantScorerRole(deployer.address);
  console.log("✅ Granted SCORER_ROLE to:", deployer.address);

  await badgeFactory.grantMinterRole(deployer.address);
  console.log("✅ Granted MINTER_ROLE to:", deployer.address);

  await xpSystem.grantGranterRole(deployer.address);
  console.log("✅ Granted GRANTER_ROLE to:", deployer.address);

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("GUILD_REGISTRY_ADDRESS=" + guildRegistryAddress);
  console.log("SEASON_ENGINE_ADDRESS=" + seasonEngineAddress);
  console.log("BADGE_FACTORY_ADDRESS=" + badgeFactoryAddress);
  console.log("XP_SYSTEM_ADDRESS=" + xpSystemAddress);
  console.log("DEPLOYMENT_TRACKER_ADDRESS=" + deploymentTrackerAddress);
  console.log("\n💡 Add these to your .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
