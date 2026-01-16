'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Trophy, Users } from 'lucide-react'

export function SeasonOverview() {
  // TODO: Fetch from API
  const season = {
    name: 'Season 1: Genesis',
    status: 'ACTIVE',
    startAt: new Date('2025-01-01'),
    endAt: new Date('2025-02-15'),
    totalGuilds: 42,
    totalPlayers: 1337,
  }

  const daysLeft = Math.ceil((season.endAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{season.name}</h1>
          <Badge variant="success" className="bg-accent/20 text-accent border-accent/30">
            {season.status}
          </Badge>
        </div>
        <Trophy className="h-12 w-12 text-accent" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Days Left</p>
            <p className="text-2xl font-bold">{daysLeft}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Guilds</p>
            <p className="text-2xl font-bold">{season.totalGuilds}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Players</p>
            <p className="text-2xl font-bold">{season.totalPlayers}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
