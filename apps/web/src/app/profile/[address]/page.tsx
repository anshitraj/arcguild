'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, TrendingUp, Code, Award } from 'lucide-react'
import { ApiClient } from '@arcguilds/sdk'

const api = new ApiClient({ baseUrl: typeof window !== 'undefined' ? window.location.origin : '' })

export default function ProfilePage() {
  const params = useParams()
  const address = params.address as string
  const [user, setUser] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [address])

  async function loadProfile() {
    try {
      setLoading(true)

      // Load user data
      const userResponse = await fetch(`/api/users/${address}`)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }

      // Load badges
      const badgesData = await api.getBadges({ userId: address })
      setBadges(badgesData)

      // Load deployments
      const deploymentsResponse = await fetch(`/api/deployments?userId=${address}`)
      if (deploymentsResponse.ok) {
        const deploymentsData = await deploymentsResponse.json()
        setDeployments(deploymentsData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">User not found</p>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-mono text-muted-foreground">{address}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="font-bold">XP & Level</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{user.xp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold">Level {user.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reputation</p>
                <p className="text-2xl font-bold">{user.reputation}/100</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h2 className="font-bold">Stats</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Missions Completed</p>
                <p className="text-2xl font-bold">{user.totalMissions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contracts Deployed</p>
                <p className="text-2xl font-bold">{user.totalDeployments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{user.currentStreak} days</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-purple-500" />
              <h2 className="font-bold">Badges</h2>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{badges.length}</p>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </Card>
        </div>

        {badges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="p-4 text-center">
                  {badge.badgeTemplate?.imageUrl ? (
                    <img
                      src={badge.badgeTemplate.imageUrl}
                      alt={badge.badgeTemplate.name}
                      className="w-16 h-16 mx-auto rounded-lg object-cover mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs font-medium">{badge.badgeTemplate?.name || 'Badge'}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {deployments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Deployments</h2>
            <div className="space-y-2">
              {deployments.slice(0, 5).map((deployment) => (
                <Card key={deployment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{deployment.contractName}</p>
                        <p className="text-sm text-muted-foreground">
                          {deployment.template} • {deployment.status}
                        </p>
                      </div>
                    </div>
                    {deployment.contractAddress && (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {deployment.contractAddress.slice(0, 6)}...{deployment.contractAddress.slice(-4)}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
