'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Target, Flame, Zap } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

interface UserStats {
  xp: number
  level: number
  totalMissions: number
  currentStreak: number
}

export function QuickStats() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    totalMissions: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!isConnected || !address) {
        setStats({
          xp: 0,
          level: 1,
          totalMissions: 0,
          currentStreak: 0,
        })
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/users/${address}`)
        if (response.ok) {
          const user = await response.json()
          setStats({
            xp: user.xp || 0,
            level: user.level || 1,
            totalMissions: user.totalMissions || 0,
            currentStreak: user.currentStreak || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address, isConnected])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-secondary rounded w-20 mb-2" />
              <div className="h-8 bg-secondary rounded w-16" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total XP</p>
            <p className="text-3xl font-bold">{stats.xp.toLocaleString()}</p>
          </div>
          <Zap className="h-10 w-10 text-accent" />
        </div>
      </Card>

      <Card className="p-6 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Level</p>
            <p className="text-3xl font-bold">{stats.level}</p>
          </div>
          <Trophy className="h-10 w-10 text-accent" />
        </div>
      </Card>

      <Card className="p-6 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Missions</p>
            <p className="text-3xl font-bold">{stats.totalMissions}</p>
          </div>
          <Target className="h-10 w-10 text-accent" />
        </div>
      </Card>

      <Card className="p-6 hover:border-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Streak</p>
            <p className="text-3xl font-bold">{stats.currentStreak} days</p>
          </div>
          <Flame className="h-10 w-10 text-orange-500" />
        </div>
      </Card>
    </div>
  )
}
