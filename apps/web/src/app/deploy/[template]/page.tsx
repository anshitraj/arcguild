'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { ethers } from 'ethers'

const TEMPLATES = {
  erc20: {
    name: 'ERC20 Token',
    description: 'Deploy a standard fungible token',
    abi: [
      'constructor(string name, string symbol, uint256 initialSupply, uint8 decimals)',
    ],
  },
  erc721: {
    name: 'ERC721 NFT',
    description: 'Deploy an NFT collection',
    abi: [
      'constructor(string name, string symbol, string baseURI)',
    ],
  },
  erc1155: {
    name: 'ERC1155 Multi-Token',
    description: 'Deploy a multi-token contract',
    abi: [
      'constructor(string uri)',
    ],
  },
}

export default function DeployTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const templateId = params.template as string
  const template = TEMPLATES[templateId as keyof typeof TEMPLATES]

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean
    txHash?: string
    contractAddress?: string
    error?: string
  } | null>(null)

  if (!template) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Template not found</h1>
            <Link href="/deploy">
              <Button>Back to Templates</Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet')
      return
    }

    setIsDeploying(true)
    setDeploymentResult(null)

    try {
      // In a real implementation, you would:
      // 1. Get contract bytecode from a contract factory
      // 2. Encode constructor arguments
      // 3. Deploy using ethers or wagmi
      // 4. Wait for transaction
      // 5. Get contract address
      // 6. Register with API

      // For now, this is a placeholder that shows the flow
      // You would need actual contract bytecode and deployment logic

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // This is a simplified example - you'd need actual contract factories
      alert('Deployment functionality requires contract bytecode. This is a placeholder.')

      // After successful deployment:
      // const response = await fetch('/api/deployments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     template: templateId.toUpperCase(),
      //     contractName: formData.name || `${template.name} Contract`,
      //     constructorArgs: formData,
      //     deploymentTx: txHash,
      //     contractAddress: contractAddress,
      //   }),
      // })

      setIsDeploying(false)
    } catch (error: any) {
      console.error('Deployment error:', error)
      setDeploymentResult({
        success: false,
        error: error.message || 'Deployment failed',
      })
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Link href="/deploy" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>

        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Deploy {template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>

          {!isConnected && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm">Please connect your wallet to deploy</p>
            </div>
          )}

          {deploymentResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              deploymentResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {deploymentResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  {deploymentResult.success ? (
                    <div>
                      <p className="font-semibold">Deployment Successful!</p>
                      {deploymentResult.contractAddress && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Contract: {deploymentResult.contractAddress}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Deployment Failed</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deploymentResult.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Contract Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="MyToken"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {templateId === 'erc20' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Symbol</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="MTK"
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Supply</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="1000000"
                    value={formData.initialSupply || ''}
                    onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Decimals</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="18"
                    value={formData.decimals || '18'}
                    onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                  />
                </div>
              </>
            )}

            {templateId === 'erc721' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Symbol</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="NFT"
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base URI</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="https://api.example.com/metadata/"
                    value={formData.baseURI || ''}
                    onChange={(e) => setFormData({ ...formData, baseURI: e.target.value })}
                  />
                </div>
              </>
            )}

            {templateId === 'erc1155' && (
              <div>
                <label className="block text-sm font-medium mb-2">URI</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="https://api.example.com/{id}.json"
                  value={formData.uri || ''}
                  onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                />
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || !isConnected}
                className="w-full"
                size="lg"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Contract'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
