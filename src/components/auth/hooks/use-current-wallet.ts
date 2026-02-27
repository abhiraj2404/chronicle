'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { usePrivy } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { useEffect, useState } from 'react'

export function useCurrentWallet() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const { authenticated, ready } = usePrivy()
  const { wallets } = useSolanaWallets()

  const { profiles, loading } = useGetProfiles({
    walletAddress: walletAddress || '',
  })

  useEffect(() => {
    if (authenticated && ready && wallets.length > 0) {
      setWalletAddress(wallets[0].address)
    } else {
      setWalletAddress('')
    }
  }, [wallets, authenticated, ready])

  return {
    walletIsConnected: !(walletAddress === ''),
    walletAddress,
    mainUsername: profiles?.[0]?.profile?.username,
    loadingMainUsername: loading,
    setWalletAddress,
  }
}
