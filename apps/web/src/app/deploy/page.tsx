import { Header } from '@/components/layout/header'
import { DeploymentTemplates } from '@/components/deploy/deployment-templates'
import { RecentDeployments } from '@/components/deploy/recent-deployments'
import { DeploymentStats } from '@/components/deploy/deployment-stats'

export default function DeployPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Contract Deployment Arena</h1>
          <p className="text-muted-foreground text-lg">
            Deploy real smart contracts on Arc Testnet and earn XP + badges
          </p>
        </div>

        <DeploymentStats />
        <DeploymentTemplates />
        <RecentDeployments />
      </main>
    </div>
  )
}
