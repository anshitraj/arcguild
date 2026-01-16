import { ethers } from 'ethers'

// ABI fragments (minimal for SDK usage)
export const GUILD_REGISTRY_ABI = [
  'function createGuild(string handle, string metadataURI) returns (uint256)',
  'function joinGuild(uint256 guildId, bytes32 inviteCode)',
  'function leaveGuild(uint256 guildId)',
  'function setMemberRole(uint256 guildId, address member, uint8 newRole)',
  'function rotateInviteCode(uint256 guildId) returns (bytes32)',
  'function guilds(uint256) view returns (uint256 id, string handle, string metadataURI, address creator, uint256 createdAt, bool active)',
  'function guildMembers(uint256, address) view returns (address memberAddress, uint8 role, uint256 joinedAt)',
  'function getGuildMemberCount(uint256 guildId) view returns (uint256)',
  'event GuildCreated(uint256 indexed guildId, string handle, address indexed creator, string metadataURI)',
  'event MemberJoined(uint256 indexed guildId, address indexed member, bytes32 inviteCode)',
  'event MemberLeft(uint256 indexed guildId, address indexed member)',
]

export const SEASON_ENGINE_ABI = [
  'function createSeason(string name, uint256 startTime, uint256 endTime, string configHash) returns (uint256)',
  'function startSeason(uint256 seasonId)',
  'function endSeason(uint256 seasonId)',
  'function emitScore(uint256 seasonId, uint256 guildId, address user, uint256 guildPoints, uint256 individualPoints, string reason)',
  'function seasons(uint256) view returns (uint256 id, string name, uint256 startTime, uint256 endTime, uint8 status, string configHash)',
  'function getGuildScore(uint256 seasonId, uint256 guildId) view returns (uint256)',
  'function getUserScore(uint256 seasonId, address user) view returns (uint256)',
  'event SeasonCreated(uint256 indexed seasonId, string name, uint256 startTime, uint256 endTime)',
  'event ScoreEmitted(uint256 indexed seasonId, uint256 indexed guildId, address indexed user, uint256 guildPoints, uint256 individualPoints, string reason)',
]

export const BADGE_SBT_ABI = [
  'function mintBadge(address to, uint8 badgeType, string uri) returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getBadgeType(uint256 tokenId) view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'event BadgeMinted(address indexed to, uint256 indexed tokenId, uint8 badgeType, string tokenURI)',
]

export class ContractSDK {
  private provider: ethers.Provider
  private signer?: ethers.Signer
  
  public guildRegistry: ethers.Contract
  public seasonEngine: ethers.Contract
  public badgeSBT: ethers.Contract

  constructor(
    provider: ethers.Provider,
    addresses: {
      guildRegistry: string
      seasonEngine: string
      badgeSBT: string
    },
    signer?: ethers.Signer
  ) {
    this.provider = provider
    this.signer = signer

    this.guildRegistry = new ethers.Contract(
      addresses.guildRegistry,
      GUILD_REGISTRY_ABI,
      signer || provider
    )

    this.seasonEngine = new ethers.Contract(
      addresses.seasonEngine,
      SEASON_ENGINE_ABI,
      signer || provider
    )

    this.badgeSBT = new ethers.Contract(
      addresses.badgeSBT,
      BADGE_SBT_ABI,
      signer || provider
    )
  }

  // Guild methods
  async createGuild(handle: string, metadataURI: string) {
    if (!this.signer) throw new Error('Signer required')
    const tx = await this.guildRegistry.createGuild(handle, metadataURI)
    return tx.wait()
  }

  async joinGuild(guildId: number, inviteCode: string) {
    if (!this.signer) throw new Error('Signer required')
    const tx = await this.guildRegistry.joinGuild(guildId, inviteCode)
    return tx.wait()
  }

  async getGuild(guildId: number) {
    return this.guildRegistry.guilds(guildId)
  }

  async getGuildMember(guildId: number, address: string) {
    return this.guildRegistry.guildMembers(guildId, address)
  }

  // Season methods
  async getSeasonScore(seasonId: number, guildId: number) {
    return this.seasonEngine.getGuildScore(seasonId, guildId)
  }

  async getUserScore(seasonId: number, userAddress: string) {
    return this.seasonEngine.getUserScore(seasonId, userAddress)
  }

  // Badge methods
  async getBadgeBalance(address: string) {
    return this.badgeSBT.balanceOf(address)
  }
}
