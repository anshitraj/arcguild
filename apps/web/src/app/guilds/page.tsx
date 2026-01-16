'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Users, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ApiClient } from '@arcguilds/sdk'

const api = new ApiClient({ baseUrl: typeof window !== 'undefined' ? window.location.origin : '' })

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadGuilds()
  }, [search])

  async function loadGuilds() {
    try {
      setLoading(true)
      const data = await api.getGuilds({ search: search || undefined })
      setGuilds(data)
    } catch (error) {
      console.error('Error loading guilds:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Guilds</h1>
            <p className="text-muted-foreground">Join communities and compete in seasons</p>
          </div>
          <Link href="/guilds/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Guild
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search guilds..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading guilds...</p>
          </div>
        ) : guilds.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No guilds found</p>
            <Link href="/guilds/create">
              <Button>Create First Guild</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <Link key={guild.id} href={`/guilds/${guild.handle}`}>
                <Card className="p-6 hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-4 mb-4">
                    {guild.logoUrl && (
                      <img
                        src={guild.logoUrl}
                        alt={guild.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{guild.name}</h3>
                      <p className="text-sm text-muted-foreground">@{guild.handle}</p>
                    </div>
                  </div>

                  {guild.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {guild.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {guild.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{guild._count?.members || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{guild._count?.seasons || 0} seasons</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
