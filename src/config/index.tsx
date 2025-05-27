import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base } from '@reown/appkit/networks'
import type { Chain } from 'viem'

const requiredEnvVars = {
  NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
} as const;

function validateEnvironment() {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
}

validateEnvironment();

export const projectId = requiredEnvVars.NEXT_PUBLIC_PROJECT_ID!;

export const networks: [Chain, ...Chain[]] = [base];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

export const appMetadata = {
  name: 'CS2 Skins Onchain',
  description: 'Web3 Blockchain Application for CS2 Skins',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://blockchain.lmao.cl',
  icons: ['https://youapp.com/icon.png'],
}; 