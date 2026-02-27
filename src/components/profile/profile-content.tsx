'use client'

import { Comments } from '@/components/profile/comments/comments'
import { FollowList } from '@/components/profile/follow-list'
import { MyProfile } from '@/components/profile/my-profile'
import { DisplaySuggestedAndGlobal } from '@/components/suggested-and-creators-invite/hooks/display-suggested-and-global'
import { getFollowers, getFollowing } from '@/lib/tapestry'
import type { IGetSocialResponse } from '@/models/profile.models'
import { PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'
import { BarChart2, ImageIcon, User } from 'lucide-react'
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
                followers={
                  followers || { profiles: [], page: 0, pageSize: 0 }
                }
                following={
                  following || { profiles: [], page: 0, pageSize: 0 }
                }
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
