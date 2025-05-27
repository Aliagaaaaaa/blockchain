'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { config, networks, projectId, wagmiAdapter, appMetadata } from '@/config'
import { base } from '@reown/appkit/networks'

// Create QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Initialize AppKit with error handling
function initializeAppKit() {
  try {
    createAppKit({
      adapters: [wagmiAdapter],
      projectId: projectId,
      networks: networks,
      defaultNetwork: base,
      metadata: appMetadata,
      features: { 
        analytics: true, 
        email: false, 
        socials: false 
      },
    })
  } catch (error) {
    console.error("AppKit Initialization Error:", error)
    throw new Error("Failed to initialize wallet connection. Please check your configuration.")
  }
}

// Initialize AppKit
initializeAppKit()

interface ContextProviderProps {
  children: ReactNode
  cookies: string | null
}

export default function ContextProvider({
  children,
  cookies,
}: ContextProviderProps) {
  const initialState = cookieToInitialState(config as Config, cookies)

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
} 