'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Guild {
  id: string
  handle: string
  name: string
  description: string | null
  logoUrl: string | null
  tags: string[]
  _count: {
    members: number
  }
  seasons?: Array<{
    name: string
  }>
}

export function FeaturedGuilds() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGuilds() {
      try {
        const response = await fetch('/api/guilds')
        if (response.ok) {
          const data = await response.json()
          setGuilds(data.slice(0, 3)) // Get top 3 featured guilds
        }
      } catch (error) {
        console.error('Failed to fetch guilds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Guilds</h2>
            <p className="text-muted-foreground">Join a community and start earning</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-secondary rounded-lg mb-4" />
                <div className="h-4 bg-secondary rounded w-24 mb-2" />
                <div className="h-3 bg-secondary rounded w-32 mb-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (guilds.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Guilds</h2>
            <p className="text-muted-foreground">Join a community and start earning</p>
          </div>
          <Link href="/guilds">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No guilds found. Be the first to create one!</p>
          <Link href="/guilds/create">
            <Button className="mt-4">Create Guild</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Guilds</h2>
          <p className="text-muted-foreground">Join a community and start earning</p>
        </div>
        <Link href="/guilds">
          <Button variant="ghost" className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guilds.map((guild) => (
          <Card key={guild.id} className="p-6 hover:border-accent/50 transition-all group">
            <div className="flex items-start gap-4 mb-4">
              {guild.logoUrl ? (
                <img
                  src={guild.logoUrl}
                  alt={guild.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                  {guild.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 group-hover:text-accent transition-colors">
                  {guild.name}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">@{guild.handle}</p>
              </div>
            </div>

            {guild.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {guild.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {guild.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{guild._count.members} members</span>
              </div>
              <div className="flex items-center gap-1 text-accent">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Active</span>
              </div>
            </div>

            <Link href={`/guilds/${guild.handle}`}>
              <Button className="w-full" size="sm">
                View Guild
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
