import { ConnectWallet } from '@/components/connect-wallet'
import { BalanceCard } from '@/components/balance-card'
import { TokenRow } from '@/components/token-row'
import { QuickActions } from '@/components/send-receive'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Onchain App Starter Kit - Modify this file for your app!
// Available components: ConnectWallet, BalanceCard, NetworkBadge, TokenRow, QuickActions,
// ChainSelector, AddressDisplay, TxStatus, TransactionWatcher
// Wagmi hooks: useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useWriteContract

export default function App() {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mx-auto mb-8 max-w-2xl flex items-center justify-between">
        <h1 className="text-2xl font-bold">Onchain App</h1>
        <ConnectWallet />
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl space-y-6">
        <BalanceCard chainId="Arc_Testnet" />
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenRow chainId="Arc_Testnet" />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Get testnet USDC from{' '}
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            faucet.circle.com
          </a>
        </p>
      </main>
    </div>
  )
}
