'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

export function DeploymentTemplates() {
  const templates = [
    {
      id: 'erc20',
      name: 'ERC20 Token',
      description: 'Deploy a standard fungible token with customizable supply and decimals',
      icon: '🪙',
      xpReward: 500,
      difficulty: 'Beginner',
      estimatedGas: '~0.5 USDC',
      features: ['Mintable', 'Burnable', 'Pausable'],
      locked: false,
    },
    {
      id: 'erc721',
      name: 'NFT Collection',
      description: 'Create an ERC721 NFT collection with metadata and minting controls',
      icon: '🖼️',
      xpReward: 750,
      difficulty: 'Intermediate',
      estimatedGas: '~0.8 USDC',
      features: ['Enumerable', 'URI Storage', 'Royalties'],
      locked: false,
    },
    {
      id: 'erc1155',
      name: 'Multi-Token',
      description: 'Deploy an ERC1155 contract for multiple token types',
      icon: '🎨',
      xpReward: 800,
      difficulty: 'Intermediate',
      estimatedGas: '~0.9 USDC',
      features: ['Batch Minting', 'URI Management'],
      locked: false,
    },
    {
      id: 'multisig',
      name: 'Multisig Wallet',
      description: 'Secure multisig wallet requiring multiple signatures',
      icon: '🔐',
      xpReward: 1000,
      difficulty: 'Advanced',
      estimatedGas: '~1.2 USDC',
      features: ['Multi-owner', 'Threshold', 'Transaction Queue'],
      locked: false,
    },
    {
      id: 'timelock',
      name: 'Timelock Controller',
      description: 'Timelock contract for delayed execution of transactions',
      icon: '⏰',
      xpReward: 900,
      difficulty: 'Advanced',
      estimatedGas: '~1.0 USDC',
      features: ['Delay Period', 'Cancellation', 'Role-based'],
      locked: false,
    },
    {
      id: 'governor',
      name: 'DAO Governor',
      description: 'Full-featured DAO governance contract',
      icon: '🏛️',
      xpReward: 1500,
      difficulty: 'Expert',
      estimatedGas: '~2.0 USDC',
      features: ['Voting', 'Proposals', 'Timelock Integration'],
      locked: true,
      unlockRequirement: 'Level 10 required',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contract Templates</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`p-6 transition-all ${
              template.locked 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:border-accent/50 cursor-pointer group'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{template.icon}</div>
              {template.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>

            <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
              {template.name}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {template.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <Badge 
                  variant={
                    template.difficulty === 'Beginner' ? 'success' :
                    template.difficulty === 'Intermediate' ? 'default' :
                    template.difficulty === 'Advanced' ? 'default' :
                    'destructive'
                  }
                >
                  {template.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reward</span>
                <span className="flex items-center gap-1 text-accent font-mono">
                  <Zap className="h-3 w-3" />
                  +{template.xpReward} XP
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Est. Gas</span>
                <span className="font-mono text-xs">{template.estimatedGas}</span>
              </div>
            </div>

            {template.locked ? (
              <Button className="w-full" size="sm" disabled>
                <Lock className="h-4 w-4 mr-2" />
                {template.unlockRequirement}
              </Button>
            ) : (
              <Link href={`/deploy/${template.id}`}>
                <Button className="w-full" size="sm">
                  <Code className="h-4 w-4 mr-2" />
                  Deploy Contract
                </Button>
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
