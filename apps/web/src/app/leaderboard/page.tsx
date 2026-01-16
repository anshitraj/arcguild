'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Users } from 'lucide-react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [type, setType] = useState<'individual' | 'guild'>('individual')
  const [loading, setLoading] = useState(true)
  const seasonId = 'current' // In real app, get from context

  useEffect(() => {
    loadLeaderboard()
  }, [type, seasonId])

  async function loadLeaderboard() {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?seasonId=${seasonId}&type=${type}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />
    return <span className="text-muted-foreground">#{rank}</span>
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers this season</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setType('individual')}
            className={`px-4 py-2 rounded-md ${
              type === 'individual'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Individual
          </button>
          <button
            onClick={() => setType('guild')}
            className={`px-4 py-2 rounded-md ${
              type === 'guild'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Guilds
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No rankings yet</p>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1

                if (type === 'guild') {
                  return (
                    <div
                      key={entry.guild?.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-input hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 text-center">
                          {getRankIcon(rank)}
                        </div>
                        {entry.guild?.logoUrl && (
                          <img
                            src={entry.guild.logoUrl}
                            alt={entry.guild.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <Link href={`/guilds/${entry.guild?.handle}`}>
                            <p className="font-bold hover:text-accent">{entry.guild?.name}</p>
                          </Link>
                          <p className="text-sm text-muted-foreground">@{entry.guild?.handle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.guildXP.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Guild XP</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={entry.user?.address}
                    className="flex items-center justify-between p-4 rounded-lg border border-input hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-center">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <Link href={`/profile/${entry.user?.address}`}>
                          <p className="font-bold hover:text-accent font-mono">
                            {entry.user?.address.slice(0, 6)}...{entry.user?.address.slice(-4)}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Level {entry.user?.level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {entry.user?.reputation}/100 Rep
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.seasonXP.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Season XP</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
