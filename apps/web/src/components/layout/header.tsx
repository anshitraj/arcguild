'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { NetworkArc } from '@web3icons/react'

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <NetworkArc size={32} variant="branded" />
              <span className="text-xl font-bold">ArcGuilds</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/guilds" className="text-sm hover:text-accent transition-colors">
                Guilds
              </Link>
              <Link href="/missions" className="text-sm hover:text-accent transition-colors">
                Missions
              </Link>
              <Link href="/leaderboard" className="text-sm hover:text-accent transition-colors">
                Leaderboard
              </Link>
              <Link href="/wars" className="text-sm hover:text-accent transition-colors">
                Wars
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}
