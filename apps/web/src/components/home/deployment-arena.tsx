'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code, Zap, Award, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface DeploymentTemplate {
  id: string
  name: string
  description: string
  xpReward: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  icon: string
}

interface DeploymentStats {
  totalDeployments: number
  successfulDeployments: number
  totalXP: number
}

export function DeploymentArena() {
  const { address, isConnected } = useAccount()
  const [stats, setStats] = useState<DeploymentStats>({
    totalDeployments: 0,
    successfulDeployments: 0,
    totalXP: 0,
  })
  const [loading, setLoading] = useState(true)

  const templates: DeploymentTemplate[] = [
    {
      id: 'ERC20',
      name: 'ERC20 Token',
      description: 'Deploy your own fungible token',
      xpReward: 500,
      difficulty: 'Beginner',
      icon: '🪙',
    },
    {
      id: 'ERC721',
      name: 'NFT Collection',
      description: 'Create an NFT collection',
      xpReward: 750,
      difficulty: 'Intermediate',
      icon: '🖼️',
    },
    {
      id: 'MULTISIG',
      name: 'Multisig Wallet',
      description: 'Deploy a secure multisig',
      xpReward: 1000,
      difficulty: 'Advanced',
      icon: '🔐',
    },
  ]

  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams()
        if (isConnected && address) {
          params.set('userId', address)
        }

        const response = await fetch(`/api/deployments?${params}`)
        if (response.ok) {
          const deployments = await response.json()
          const successful = deployments.filter((d: any) => d.status === 'SUCCESS')
          const totalXP = deployments.reduce((sum: number, d: any) => sum + (d.xpAwarded || 0), 0)

          setStats({
            totalDeployments: deployments.length,
            successfulDeployments: successful.length,
            totalXP,
          })
        }
      } catch (error) {
        console.error('Failed to fetch deployment stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address, isConnected])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Code className="h-8 w-8 text-accent" />
            Contract Deployment Arena
          </h2>
          <p className="text-muted-foreground">Deploy real contracts and earn XP + badges</p>
        </div>
        <Link href="/deploy">
          <Button variant="outline" className="gap-2">
            View All Templates
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6 hover:border-accent/50 transition-all group">
            <div className="text-4xl mb-4">{template.icon}</div>
            
            <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
              {template.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {template.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <Badge 
                variant={
                  template.difficulty === 'Beginner' ? 'success' :
                  template.difficulty === 'Intermediate' ? 'default' :
                  'destructive'
                }
              >
                {template.difficulty}
              </Badge>
              
              <div className="flex items-center gap-1 text-accent">
                <Zap className="h-4 w-4" />
                <span className="font-mono text-sm">+{template.xpReward} XP</span>
              </div>
            </div>

            <Link href={`/deploy/${template.id}`}>
              <Button className="w-full" size="sm">
                Deploy Now
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-r from-accent/10 to-transparent border-accent/30">
          <div className="flex items-start gap-4">
            <Award className="h-12 w-12 text-accent flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Earn Deployment Badges</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deploy your first contract to earn the "First Deployment" badge. 
                Deploy 5+ contracts to unlock the "Elite Builder" badge.
              </p>
              <Link href="/badges">
                <Button variant="outline" size="sm" className="gap-2">
                  View All Badges
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:border-accent/50 transition-colors">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-12 w-12 text-accent flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-4">Deployment Stats</h3>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-secondary rounded animate-pulse" />
                  <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Deployments</span>
                    <span className="font-bold">{stats.totalDeployments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Successful</span>
                    <span className="font-bold text-accent">{stats.successfulDeployments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total XP Earned</span>
                    <span className="font-bold text-accent">{stats.totalXP.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
