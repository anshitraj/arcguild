'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, CheckCircle2 } from 'lucide-react'

export function RecentDeployments() {
  // TODO: Fetch from API
  const deployments = [
    {
      id: '1',
      contractName: 'MyToken',
      template: 'ERC20',
      address: '0x3333333333333333333333333333333333333333',
      txHash: '0xabc123...',
      timestamp: new Date('2025-01-15T10:30:00'),
      status: 'SUCCESS',
      xpAwarded: 500,
    },
    {
      id: '2',
      contractName: 'ArtCollection',
      template: 'ERC721',
      address: '0x4444444444444444444444444444444444444444',
      txHash: '0xdef456...',
      timestamp: new Date('2025-01-14T15:20:00'),
      status: 'SUCCESS',
      xpAwarded: 750,
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Recent Deployments</h2>

      <div className="space-y-4">
        {deployments.map((deployment) => (
          <Card key={deployment.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{deployment.contractName}</h3>
                  <Badge variant="secondary">{deployment.template}</Badge>
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {deployment.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Contract:</span>
                    <code className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                      {deployment.address}
                    </code>
                    <a 
                      href={`https://testnet.arcscan.app/address/${deployment.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Transaction:</span>
                    <code className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                      {deployment.txHash}
                    </code>
                    <a 
                      href={`https://testnet.arcscan.app/tx/${deployment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="text-muted-foreground">
                    Deployed {deployment.timestamp.toLocaleDateString()} at {deployment.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-accent font-mono text-lg font-bold">
                  +{deployment.xpAwarded} XP
                </div>
              </div>
            </div>
          </Card>
        ))}

        {deployments.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No deployments yet</p>
            <Button>Deploy Your First Contract</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
