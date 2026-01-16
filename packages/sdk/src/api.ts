// API client for backend services

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
}

export class ApiClient {
  private baseUrl: string
  private apiKey?: string

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl
    this.apiKey = config.apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth
  async getNonce(address: string) {
    return this.request<{ nonce: string }>(`/api/auth/nonce?address=${address}`)
  }

  async verifySignature(address: string, signature: string, nonce: string) {
    return this.request<{ token: string }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ address, signature, nonce }),
    })
  }

  // Guilds
  async getGuilds(params?: { search?: string; tags?: string[] }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.tags) query.set('tags', params.tags.join(','))
    
    return this.request<any[]>(`/api/guilds?${query}`)
  }

  async getGuild(handleOrId: string) {
    return this.request<any>(`/api/guilds/${handleOrId}`)
  }

  // Missions
  async getMissions(seasonId: string) {
    return this.request<any[]>(`/api/missions?seasonId=${seasonId}`)
  }

  async getMissionProgress(seasonId: string, userId: string) {
    return this.request<any[]>(`/api/missions/progress?seasonId=${seasonId}&userId=${userId}`)
  }

  async submitProof(data: {
    seasonId: string
    missionTemplateId: string
    payload: Record<string, any>
    attachment?: File
  }) {
    const formData = new FormData()
    formData.append('seasonId', data.seasonId)
    formData.append('missionTemplateId', data.missionTemplateId)
    formData.append('payload', JSON.stringify(data.payload))
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }

    return this.request<any>('/api/proofs/submit', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  // Leaderboard
  async getLeaderboard(seasonId: string, type: 'guild' | 'individual') {
    return this.request<any[]>(`/api/leaderboard?seasonId=${seasonId}&type=${type}`)
  }

  // Deployments
  async getDeployments(params?: { userId?: string; seasonId?: string }) {
    const query = new URLSearchParams()
    if (params?.userId) query.set('userId', params.userId)
    if (params?.seasonId) query.set('seasonId', params.seasonId)
    return this.request<any[]>(`/api/deployments?${query}`)
  }

  async createDeployment(data: {
    template: string
    contractName: string
    constructorArgs?: Record<string, any>
    seasonId?: string
    deploymentTx?: string
    contractAddress?: string
  }) {
    return this.request<any>('/api/deployments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyDeployment(deploymentId: string) {
    return this.request<any>(`/api/deployments/${deploymentId}/verify`, {
      method: 'POST',
    })
  }

  // Badges
  async getBadges(params?: { userId?: string; guildId?: string; seasonId?: string }) {
    const query = new URLSearchParams()
    if (params?.userId) query.set('userId', params.userId)
    if (params?.guildId) query.set('guildId', params.guildId)
    if (params?.seasonId) query.set('seasonId', params.seasonId)
    return this.request<any[]>(`/api/badges?${query}`)
  }

  async checkBadgeConditions(badgeTemplateId: string) {
    return this.request<{ eligible: boolean; reason?: string }>('/api/badges/check-conditions', {
      method: 'POST',
      body: JSON.stringify({ badgeTemplateId }),
    })
  }

  async mintBadge(data: {
    badgeTemplateId: string
    txHash?: string
    tokenId?: string
    contractAddress?: string
  }) {
    return this.request<any>('/api/badges/mint', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Guilds
  async createGuild(data: {
    handle: string
    name: string
    description?: string
    logoUrl?: string
    bannerUrl?: string
    tags?: string[]
    website?: string
    twitter?: string
    discord?: string
  }) {
    return this.request<any>('/api/guilds', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async joinGuild(guildId: string, inviteCode?: string) {
    return this.request<any>(`/api/guilds/${guildId}/join`, {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    })
  }

  async leaveGuild(guildId: string) {
    return this.request<any>(`/api/guilds/${guildId}/leave`, {
      method: 'POST',
    })
  }
}
