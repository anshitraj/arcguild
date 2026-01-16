import { Header } from '@/components/layout/header'
import { Hero } from '@/components/home/hero'
import { FeaturedGuilds } from '@/components/home/featured-guilds'
import { ActiveMissions } from '@/components/home/active-missions'
import { DeploymentArena } from '@/components/home/deployment-arena'
import { QuickStats } from '@/components/home/quick-stats'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 space-y-12">
        <Hero />
        <QuickStats />
        <FeaturedGuilds />
        <ActiveMissions />
        <DeploymentArena />
      </main>
    </div>
  )
}
