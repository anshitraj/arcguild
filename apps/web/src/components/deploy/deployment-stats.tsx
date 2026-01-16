'use client'

import { Card } from '@/components/ui/card'
import { Rocket, CheckCircle2, TrendingUp } from 'lucide-react'

export function DeploymentStats() {
  // TODO: Fetch from API
  const stats = {
    totalDeployments: 3,
    successRate: 100,
    totalXPEarned: 2250,
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Deployments</p>
            <p className="text-3xl font-bold">{stats.totalDeployments}</p>
          </div>
          <Rocket className="h-10 w-10 text-accent" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
            <p className="text-3xl font-bold">{stats.successRate}%</p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">XP from Deploys</p>
            <p className="text-3xl font-bold">{stats.totalXPEarned}</p>
          </div>
          <TrendingUp className="h-10 w-10 text-accent" />
        </div>
      </Card>
    </div>
  )
}
