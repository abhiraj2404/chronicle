'use client'

import { createProfileAfterLogin } from '@/lib/create-profile-after-login'
import type { IProfileList } from '@/models/profile.models'
import { useCreateWallet, usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AuthLoadingScreen } from './auth-loading-screen'

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  /** Whether auth + profile resolution is still in progress */
  isResolvingAuth: boolean
  /** Privy is ready AND user is authenticated */
  isAuthenticated: boolean
  /** Solana wallet address (from embedded or external wallet) */
  walletAddress: string
  /** Tapestry username — set only after profile is confirmed/created */
  username: string | null
  /** Convenience: all Tapestry profiles for this wallet */
  profiles: IProfileList[]
  /** Trigger Privy logout + reset state */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isResolvingAuth: true,
  isAuthenticated: false,
  walletAddress: '',
  username: null,
  profiles: [],
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// ─── Auth stages for the loading screen ───────────────────────────────────────
export type AuthStage =
  | 'idle' // not authenticated
  | 'waiting-wallet' // authenticated, waiting for embedded wallet
  | 'checking-profile' // fetching profile from tapestry
  | 'creating-profile' // no profile found → creating one
  | 'redirecting' // profile resolved → navigating
  | 'done' // fully resolved

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, logout } = usePrivy()
  const { createWallet } = useCreateWallet()
  const router = useRouter()

  const [walletAddress, setWalletAddress] = useState('')
  const [profiles, setProfiles] = useState<IProfileList[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [stage, setStage] = useState<AuthStage>('idle')
  const [isResolvingAuth, setIsResolvingAuth] = useState(true)

  const resolvingRef = useRef(false)
  const resolvedWalletRef = useRef<string | null>(null)
  const walletCreationRef = useRef(false)

  // ── 1. Wallet setup ─────────────────────────────────────────────────────
  // With whitelabel OAuth (useLoginWithOAuth), createOnLogin does NOT work.
  // We must manually create the embedded wallet after authentication.
  useEffect(() => {
    if (!authenticated || !ready) return

    // Check if user already has a wallet (e.g. returning user)
    const existingWallet = user?.wallet?.address
    if (existingWallet) {
      console.log('[AuthProvider] User already has wallet:', existingWallet)
      setWalletAddress(existingWallet)
      return
    }

    // No wallet yet — create one manually
    if (walletCreationRef.current) return
    walletCreationRef.current = true
    setStage('waiting-wallet')
    setIsResolvingAuth(true)

    console.log('[AuthProvider] Creating embedded Solana wallet...')
    createWallet()
      .then((wallet) => {
        console.log('[AuthProvider] Wallet created:', wallet.address)
        setWalletAddress(wallet.address)
      })
      .catch((err) => {
        console.error('[AuthProvider] Wallet creation failed:', err)
        // If it fails because wallet already exists, try reading from user
        if (user?.wallet?.address) {
          setWalletAddress(user.wallet.address)
        } else {
          walletCreationRef.current = false
        }
      })
  }, [authenticated, ready, user?.wallet?.address, createWallet])

  // ── Reset on logout ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!authenticated && ready) {
      setWalletAddress('')
      setProfiles([])
      setUsername(null)
      setStage('idle')
      setIsResolvingAuth(false)
      resolvingRef.current = false
      resolvedWalletRef.current = null
      walletCreationRef.current = false
    }
  }, [authenticated, ready])

  // ── 2. Profile resolution pipeline ──────────────────────────────────────
  useEffect(() => {
    // Skip if not ready, or already resolving for THIS wallet
    if (!authenticated || !walletAddress) return
    if (resolvingRef.current && resolvedWalletRef.current === walletAddress)
      return

    // New wallet detected — allow fresh resolution
    if (resolvedWalletRef.current !== walletAddress) {
      resolvingRef.current = false
    }
    if (resolvingRef.current) return

    resolvingRef.current = true
    resolvedWalletRef.current = walletAddress
    let cancelled = false

    async function resolve() {
      try {
        // Stage: checking profile
        setStage('checking-profile')

        console.log(
          '[AuthProvider] Resolving profile for wallet:',
          walletAddress,
        )
        const res = await fetch(
          `/api/profiles?walletAddress=${walletAddress}`,
          {
            cache: 'no-store',
          },
        )
        const data = await res.json()
        console.log('[AuthProvider] API response:', JSON.stringify(data))
        if (cancelled) return

        if (data.profiles && data.profiles.length > 0) {
          // ✅ Profile exists
          const resolvedProfiles: IProfileList[] = data.profiles
          const resolvedUsername = resolvedProfiles[0].profile.username
          console.log(
            '[AuthProvider] Found existing profile:',
            resolvedUsername,
          )

          setProfiles(resolvedProfiles)
          setUsername(resolvedUsername)
          setStage('redirecting')

          // Small delay so user sees "redirecting" state
          await new Promise((r) => setTimeout(r, 400))
          if (cancelled) return

          router.replace(`/${resolvedUsername}`)
          setStage('done')
          setIsResolvingAuth(false)
        } else {
          // ❌ No profile → create one
          setStage('creating-profile')

          const googleName = user?.google?.name
          const created = await createProfileAfterLogin(
            walletAddress,
            googleName,
          )
          if (cancelled) return

          if (created) {
            // Refetch to get the full profile object
            const refetch = await fetch(
              `/api/profiles?walletAddress=${walletAddress}`,
              { cache: 'no-store' },
            )
            const refetchData = await refetch.json()
            if (cancelled) return

            const resolvedProfiles: IProfileList[] = refetchData.profiles || []
            const resolvedUsername =
              resolvedProfiles[0]?.profile?.username ||
              created.profile?.username ||
              null

            setProfiles(resolvedProfiles)
            setUsername(resolvedUsername)
            setStage('redirecting')

            await new Promise((r) => setTimeout(r, 400))
            if (cancelled) return

            if (resolvedUsername) {
              router.replace(`/${resolvedUsername}`)
            }
          }

          setStage('done')
          setIsResolvingAuth(false)
        }
      } catch (error) {
        console.error('[AuthProvider] profile resolution failed:', error)
        if (!cancelled) {
          setStage('done')
          setIsResolvingAuth(false)
        }
      } finally {
        resolvingRef.current = false
      }
    }

    resolve()

    return () => {
      cancelled = true
    }
  }, [authenticated, walletAddress, user, router])

  // ── Mark not-resolving when unauthenticated ─────────────────────────────
  useEffect(() => {
    if (ready && !authenticated) {
      setIsResolvingAuth(false)
    }
  }, [ready, authenticated])

  // ── Sign out ────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Privy may 400 if session already expired — ignore
    }
    setWalletAddress('')
    setProfiles([])
    setUsername(null)
    setStage('idle')
    setIsResolvingAuth(false)
    resolvingRef.current = false
    resolvedWalletRef.current = null
    walletCreationRef.current = false
    router.replace('/profile')
  }, [logout, router])

  // ── Show loading screen during active resolution ────────────────────────
  const showLoadingScreen =
    authenticated && stage !== 'idle' && stage !== 'done'

  return (
    <AuthContext.Provider
      value={{
        isResolvingAuth,
        isAuthenticated: ready && authenticated,
        walletAddress,
        username,
        profiles,
        signOut,
      }}
    >
      {showLoadingScreen && <AuthLoadingScreen stage={stage} />}
      {children}
    </AuthContext.Provider>
  )
}
