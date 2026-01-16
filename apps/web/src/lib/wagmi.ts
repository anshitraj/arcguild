import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, polygonAmoy, lineaSepolia } from 'wagmi/chains'
import { defineChain } from 'viem'

// Define Arc Testnet (custom chain not in wagmi/chains)
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] }
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' }
  },
  testnet: true
})

export const config = getDefaultConfig({
  appName: 'ArcGuilds',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arcTestnet, sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, polygonAmoy, lineaSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
})
