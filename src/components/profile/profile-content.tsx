'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Comments } from '@/components/profile/comments/comments'
import { FollowList } from '@/components/profile/follow-list'
import { MyProfile } from '@/components/profile/my-profile'
import { DisplaySuggestedAndGlobal } from '@/components/suggested-and-creators-invite/hooks/display-suggested-and-global'
import { getFollowers, getFollowing } from '@/lib/tapestry'
import type { IGetSocialResponse } from '@/models/profile.models'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'
import {
  BarChart2,
  ImageIcon,
  LogIn,
  LogOut,
  Shield,
  Star,
  Trophy,
  User,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PortfolioView } from './portfolio-view'

interface Props {
  username: string
}

type Tab = 'profile' | 'portfolio' | 'nfts'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Profile', icon: <User size={14} /> },
  { key: 'portfolio', label: 'Tokens', icon: <BarChart2 size={14} /> },
  { key: 'nfts', label: 'NFTs', icon: <ImageIcon size={14} /> },
]

export function ProfileContent({ username }: Props) {
  const { mainUsername } = useCurrentWallet()
  const { ready, authenticated, logout } = usePrivy()
  const { login } = useLogin()
  const router = useRouter()
  const isOwnProfile =
    !!mainUsername && (mainUsername === username || mainUsername === username)
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<IGetSocialResponse | null>(null)
  const [following, setFollowing] = useState<IGetSocialResponse | null>(null)
  const [profileUsername, setProfileUsername] = useState(username)
  const [selectedTab, setSelectedTab] = useState<Tab>('profile')

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      try {
        let actualUsername = username
        try {
          new PublicKey(username)
          const profilesResponse = await fetch(
            `/api/profiles?walletAddress=${username}`,
          )
          const profiles = await profilesResponse.json()
          if (profiles && profiles.length > 0) {
            actualUsername = profiles[0].username
            setProfileUsername(actualUsername)
          }
        } catch {
          actualUsername = username
        }

        const followersData = await getFollowers({ username: actualUsername })
        const followingData = await getFollowing({ username: actualUsername })
        setFollowers(followersData)
        setFollowing(followingData)
      } catch (error) {
        console.error('Error initializing profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [username])

  // Special-case wallet
  useEffect(() => {
    if (username === '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz') {
      setProfileUsername('8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz')
      setIsLoading(false)
    }
  }, [username])

  // ── Not authenticated — show login UI ───────────────────────────────────
  if (ready && !authenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center px-6 gap-6"
        style={{ minHeight: 'calc(100dvh - 72px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(20,184,166,0.08))',
              border: '1.5px solid rgba(34,197,94,0.2)',
              boxShadow: '0 0 40px rgba(34,197,94,0.1)',
            }}
          >
            <User size={40} className="text-green-500/50" />
          </div>
          <div
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              boxShadow: '0 0 12px rgba(34,197,94,0.4)',
            }}
          >
            <Zap size={14} fill="white" className="text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl font-black text-white">Your Profile</h1>
          <p className="text-sm text-zinc-500 max-w-[260px]">
            Connect your wallet to start building your on-chain reputation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full max-w-[320px] space-y-2"
        >
          {[
            {
              icon: (
                <Star size={14} fill="#fbbf24" className="text-yellow-400" />
              ),
              text: 'Build verifiable reputation as a caller',
            },
            {
              icon: (
                <Trophy size={14} fill="#22c55e" className="text-green-500" />
              ),
              text: 'Compete for the leaderboard top spot',
            },
            {
              icon: (
                <Shield size={14} fill="#60a5fa" className="text-blue-400" />
              ),
              text: 'Get followed when your picks win',
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {icon}
              <span className="text-xs text-zinc-400">{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => login()}
          className="w-full max-w-[320px] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 0 24px rgba(34,197,94,0.3)',
          }}
        >
          <LogIn size={16} />
          Connect Wallet
        </motion.button>
      </div>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full animate-pulse"
            style={{
              background:
                'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(20,184,166,0.2))',
            }}
          />
          <div className="h-3 w-28 bg-zinc-800 rounded-full animate-pulse" />
          <div className="h-2 w-20 bg-zinc-800 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-4">
      {/* Logout button — own profile only */}
      {isOwnProfile && (
        <div className="flex justify-end">
          <button
            onClick={async () => {
              try {
                await logout()
              } catch {
                // Privy may 400 if session already expired — ignore
              }
              router.replace('/profile')
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 transition-all active:scale-95"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}

      {/* Profile card */}
      <MyProfile username={profileUsername} />

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-1 flex gap-1"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {TABS.map(({ key, label, icon }) => {
          const active = selectedTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                      color: '#fff',
                      boxShadow: '0 0 12px rgba(34,197,94,0.2)',
                    }
                  : { color: '#6b7280' }
              }
            >
              {icon}
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {selectedTab === 'profile' ? (
          <>
            <div className="flex flex-col gap-3">
              <FollowList
                followers={followers || { profiles: [], page: 0, pageSize: 0 }}
                following={following || { profiles: [], page: 0, pageSize: 0 }}
              />
              <DisplaySuggestedAndGlobal username={profileUsername} />
            </div>
            <div className="mt-3">
              <Comments username={profileUsername} />
            </div>
          </>
        ) : (
          <PortfolioView
            username={username}
            initialTokenType={selectedTab === 'nfts' ? 'nft' : 'fungible'}
          />
        )}
      </motion.div>
    </div>
  )
}
