import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base, sepolia } from 'wagmi/chains';

// ØG Chain configuration (placeholder - replace with actual ØG Chain details)
export const ogChain = {
  id: 42069, // Placeholder chain ID
  name: 'ØG Chain',
  network: 'og-chain',
  nativeCurrency: {
    decimals: 18,
    name: 'ØG Token',
    symbol: 'ØG',
  },
  rpcUrls: {
    public: { http: ['https://rpc.ogchain.io'] },
    default: { http: ['https://rpc.ogchain.io'] },
  },
  blockExplorers: {
    default: { name: 'ØG Explorer', url: 'https://explorer.ogchain.io' },
  },
  testnet: false,
} as const;

export const config = getDefaultConfig({
  appName: 'Homare - Web3 Affiliate Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [ogChain, mainnet, polygon, arbitrum, optimism, base, sepolia],
  ssr: true,
});

// Contract addresses (replace with actual deployed addresses)
export const CONTRACT_ADDRESSES = {
  TASK_REGISTRY: process.env.NEXT_PUBLIC_TASK_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
  PAYOUT_SPLITTER: process.env.NEXT_PUBLIC_PAYOUT_SPLITTER_ADDRESS || '0x0000000000000000000000000000000000000000',
  VERIFIER_GATEWAY: process.env.NEXT_PUBLIC_VERIFIER_GATEWAY_ADDRESS || '0x0000000000000000000000000000000000000000',
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// ABI imports (these would be generated from the compiled contracts)
export const TASK_REGISTRY_ABI = [
  // TaskRegistry ABI would go here
] as const;

export const PAYOUT_SPLITTER_ABI = [
  // PayoutSplitter ABI would go here
] as const;

export const VERIFIER_GATEWAY_ABI = [
  // VerifierGateway ABI would go here
] as const;

