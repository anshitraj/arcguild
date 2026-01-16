'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Rocket, Trophy, Code } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-background to-background border border-accent/30 p-12">
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium mb-6">
          <Rocket className="h-4 w-4" />
          <span>Build, Deploy, Earn on Arc Network</span>
        </div>
        
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Contribution & Gamification Platform for Arc
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Join guilds, complete missions, deploy contracts, and earn badges. 
          Your skills and contributions are provably recorded onchain.
        </p>
        
        <div className="flex items-center gap-4">
          <Link href="/guilds">
            <Button size="lg" className="gap-2">
              <Trophy className="h-5 w-5" />
              Browse Guilds
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          
          <Link href="/deploy">
            <Button size="lg" variant="outline" className="gap-2">
              <Code className="h-5 w-5" />
              Deploy Contract
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
    </div>
  )
}
