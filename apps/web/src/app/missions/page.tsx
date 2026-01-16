'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Zap, Trophy } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@arcguilds/sdk'

const api = new ApiClient({ baseUrl: typeof window !== 'undefined' ? window.location.origin : '' })

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [seasonId, setSeasonId] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you'd get the active season from context or API
    // For now, we'll use a placeholder
    if (seasonId) {
      loadMissions()
      loadProgress()
    }
  }, [seasonId])

  async function loadMissions() {
    if (!seasonId) return
    try {
      setLoading(true)
      const data = await api.getMissions(seasonId)
      setMissions(data)
    } catch (error) {
      console.error('Error loading missions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadProgress() {
    if (!seasonId) return
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/missions/progress?seasonId=${seasonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const progressMap: Record<string, any> = {}
        data.forEach((p: any) => {
          progressMap[p.missionTemplateId] = p
        })
        setProgress(progressMap)
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Missions</h1>
          <p className="text-muted-foreground">Complete missions to earn XP and climb the leaderboard</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading missions...</p>
          </div>
        ) : missions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No active missions</p>
            <p className="text-sm text-muted-foreground">Join a guild to see available missions</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => {
              const missionProgress = progress[mission.id]
              const isCompleted = missionProgress?.completed

              return (
                <Card key={mission.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{mission.title}</h3>
                        {isCompleted && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{mission.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-mono">+{mission.xpReward} XP</span>
                    </div>
                    {mission.guildScore > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        <span className="font-mono">+{mission.guildScore} Guild Score</span>
                      </div>
                    )}
                  </div>

                  {mission.type === 'OFFCHAIN_PROOF' && (
                    <Link href={`/missions/${mission.id}/submit`}>
                      <Button variant={isCompleted ? 'outline' : 'default'}>
                        {isCompleted ? 'View Submission' : 'Submit Proof'}
                      </Button>
                    </Link>
                  )}

                  {mission.type === 'ONCHAIN_ACTION' && (
                    <div className="text-sm text-muted-foreground">
                      This mission is tracked automatically onchain
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
