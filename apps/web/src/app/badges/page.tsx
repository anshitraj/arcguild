'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, CheckCircle2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ApiClient } from '@arcguilds/sdk'

const api = new ApiClient({ baseUrl: typeof window !== 'undefined' ? window.location.origin : '' })

export default function BadgesPage() {
  const { address } = useAccount()
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBadges()
  }, [address])

  async function loadBadges() {
    try {
      setLoading(true)
      if (address) {
        const data = await api.getBadges({ userId: address })
        setBadges(data)
      } else {
        // Load all badge templates
        const response = await fetch('/api/badges')
        if (response.ok) {
          const data = await response.json()
          setBadges(data)
        }
      }
    } catch (error) {
      console.error('Error loading badges:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Badges</h1>
          <p className="text-muted-foreground">
            {address ? 'Your earned badges' : 'Browse available badges'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading badges...</p>
          </div>
        ) : badges.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {address ? "You haven't earned any badges yet" : 'No badges available'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <Card key={badge.id} className="p-6 text-center">
                <div className="mb-4">
                  {badge.badgeTemplate?.imageUrl || badge.imageUrl ? (
                    <img
                      src={badge.badgeTemplate?.imageUrl || badge.imageUrl}
                      alt={badge.badgeTemplate?.name || badge.name}
                      className="w-24 h-24 mx-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto rounded-lg bg-muted flex items-center justify-center">
                      <Trophy className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1">
                  {badge.badgeTemplate?.name || badge.name}
                </h3>

                {badge.badgeTemplate?.description || badge.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.badgeTemplate?.description || badge.description}
                  </p>
                )}

                {badge.mintedAt && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Earned {new Date(badge.mintedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {badge.badgeTemplate?.guild && (
                  <Badge variant="secondary" className="mt-2">
                    {badge.badgeTemplate.guild.name}
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
