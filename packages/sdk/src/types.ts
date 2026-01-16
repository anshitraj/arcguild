// Contract types
export interface Guild {
  id: string
  handle: string
  name: string
  description?: string
  logoUrl?: string
  tags: string[]
  inviteCode: string
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  createdBy: string
  createdAt: Date
}

export interface Season {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status: 'DRAFT' | 'ACTIVE' | 'ENDED'
  config: Record<string, any>
}

export interface MissionTemplate {
  id: string
  type: 'ONCHAIN_EVENT' | 'ONCHAIN_VOLUME' | 'OFFCHAIN_PROOF' | 'OFFCHAIN_CONTENT'
  title: string
  description: string
  rules: Record<string, any>
  points: {
    individual: number
    guild: number
  }
  caps: Record<string, any>
  frequency: 'DAILY' | 'WEEKLY' | 'ONCE'
}

export interface MissionProgress {
  seasonId: string
  missionTemplateId: string
  userId: string
  guildId?: string
  progress: Record<string, any>
  pointsAwarded: number
  updatedAt: Date
}

export interface ProofSubmission {
  id: string
  seasonId: string
  missionTemplateId: string
  userId: string
  guildId?: string
  payload: Record<string, any>
  attachmentUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO'
  reviewerId?: string
  reviewedAt?: Date
  notes?: string
  createdAt: Date
}
