'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface MissionTemplate {
  id: string
  title: string
  description: string
  frequency: 'DAILY' | 'WEEKLY' | 'ONCE'
  xpReward: number
  guildScore: number
  rules: any
}

interface MissionProgress {
  missionTemplateId: string
  progress: any
  completed: boolean
  xpAwarded: number
}

interface MissionWithProgress extends MissionTemplate {
  progress?: {
    current: number
    target: number
  }
  completed: boolean
}

export function ActiveMissions() {
  const { address, isConnected } = useAccount()
  const [missions, setMissions] = useState<MissionWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMissions() {
      try {
        // Get active season
        const seasonResponse = await fetch('/api/seasons/active')
        if (!seasonResponse.ok) {
          setLoading(false)
          return
        }

        const season = await seasonResponse.json()

        // Fetch missions for the active season
        const missionsResponse = await fetch(`/api/missions?seasonId=${season.id}`)
        if (!missionsResponse.ok) {
          setLoading(false)
          return
        }

        const missionTemplates: MissionTemplate[] = await missionsResponse.json()

        // Fetch user progress if connected
        let progressMap: Record<string, MissionProgress> = {}
        if (isConnected && address) {
          try {
            const progressResponse = await fetch(
              `/api/missions/progress?seasonId=${season.id}&userId=${address}`
            )
            if (progressResponse.ok) {
              const progressList: MissionProgress[] = await progressResponse.json()
              progressMap = progressList.reduce((acc, p) => {
                acc[p.missionTemplateId] = p
                return acc
              }, {} as Record<string, MissionProgress>)
            }
          } catch (error) {
            console.error('Failed to fetch progress:', error)
          }
        }

        // Combine missions with progress
        const missionsWithProgress: MissionWithProgress[] = missionTemplates
          .slice(0, 6) // Show top 6 missions
          .map((mission) => {
            const progress = progressMap[mission.id]
            const progressData = progress?.progress || {}
            
            // Try to extract progress from rules or progress data
            let current = 0
            let target = 1
            
            if (progressData && typeof progressData === 'object') {
              // Try common progress fields
              if ('current' in progressData) current = Number(progressData.current) || 0
              if ('target' in progressData) target = Number(progressData.target) || 1
              if ('count' in progressData) current = Number(progressData.count) || 0
            }

            return {
              ...mission,
              progress: { current, target },
              completed: progress?.completed || false,
            }
          })

        setMissions(missionsWithProgress)
      } catch (error) {
        console.error('Failed to fetch missions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMissions()
  }, [address, isConnected])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Active Missions</h2>
          <Link href="/missions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-secondary rounded w-16 mb-3" />
                <div className="h-5 bg-secondary rounded w-32 mb-2" />
                <div className="h-3 bg-secondary rounded w-full mb-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (missions.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Active Missions</h2>
          <Link href="/missions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No active missions found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Active Missions</h2>
        <Link href="/missions">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.map((mission) => {
          const progress = mission.progress || { current: 0, target: 1 }
          const progressPercent = Math.min((progress.current / progress.target) * 100, 100)

          return (
            <Card key={mission.id} className="p-6 hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={mission.frequency === 'DAILY' ? 'default' : 'secondary'}>
                  {mission.frequency}
                </Badge>
                {mission.completed && (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                )}
              </div>

              <h3 className="font-semibold mb-2">{mission.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{mission.description}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono">
                      {progress.current}/{progress.target}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rewards</span>
                  <span className="font-mono text-accent">
                    +{mission.xpReward} XP
                  </span>
                </div>

                <Link href={`/missions/${mission.id}`}>
                  <Button className="w-full" size="sm" disabled={mission.completed}>
                    {mission.completed ? 'Completed' : 'View Details'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
