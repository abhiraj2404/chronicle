'use client'

import { useAuth } from '@/components/auth/auth-provider'

export function useCurrentWallet() {
  const { walletAddress, username, isResolvingAuth, profiles } = useAuth()

  return {
    walletIsConnected: walletAddress !== '',
    walletAddress,
    mainUsername: username ?? profiles?.[0]?.profile?.username,
    loadingMainUsername: isResolvingAuth,
    setWalletAddress: () => {}, // managed by AuthProvider
  }
}
