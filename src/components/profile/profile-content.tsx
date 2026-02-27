'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { Comments } from '@/components/profile/comments/comments'
import { FollowList } from '@/components/profile/follow-list'
import { DisplaySuggestedAndGlobal } from '@/components/suggested-and-creators-invite/hooks/display-suggested-and-global'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import type { IGetSocialResponse } from '@/models/profile.models'
import { PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'
import {
  BarChart2,
  ChevronLeft,
  ImageIcon,
  LogOut,
  User,
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
  const router = useRouter()
  const { username: myUsername, signOut, isAuthenticated, walletAddress } = useAuth()
  
  // Real Profile logic
  const isOwnProfile = !!myUsername && myUsername === username
  const [profileUsername, setProfileUsername] = useState(username)
  const { data: profileInfo, refetch: refetchProfile } = useGetProfileInfo({ username: profileUsername })

  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<IGetSocialResponse | null>(null)
  const [following, setFollowing] = useState<IGetSocialResponse | null>(null)
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

        const [followersRes, followingRes] = await Promise.all([
          fetch(
            `/api/followers/list?username=${encodeURIComponent(actualUsername)}`,
          ),
          fetch(
            `/api/following/list?username=${encodeURIComponent(actualUsername)}`,
          ),
        ])
        const followersData = followersRes.ok ? await followersRes.json() : null
        const followingData = followingRes.ok ? await followingRes.json() : null
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

  const MOCK_PROFILE_FALLBACK = {
    avatarGradient: 'linear-gradient(135deg, #10b981, #047857)',
    coverGradient: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
    postsCount: '3' // Optional, kept visually
  }

  return (
    <div
      className="max-w-xl mx-auto min-h-screen text-white pb-24"
      style={{ background: '#04060A' }}
    >
      {/* ── Header Area ─────────────────────────────────────────── */}
      <div className="relative">
        <div
          className="h-48 w-full relative"
          style={{ background: MOCK_PROFILE_FALLBACK.coverGradient }}
        >
          <div
             className="absolute inset-0 opacity-20 mix-blend-overlay"
             style={{
               backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
               backgroundSize: '24px 24px',
             }}
          />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all z-10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        {(isOwnProfile || (isAuthenticated && !myUsername)) && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/10 text-red-500 font-bold text-sm border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}

        <div className="px-6 relative -mt-16">
          <div className="flex justify-between items-end mb-4">
            <div
              className="w-32 h-32 rounded-3xl border-4 border-[#04060A] overflow-hidden flex items-center justify-center shadow-2xl relative"
              style={{ background: MOCK_PROFILE_FALLBACK.avatarGradient }}
            >
               {profileInfo?.profile?.image ? (
                 <img
                   src={profileInfo.profile.image}
                   alt="avatar"
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <span className="text-5xl font-black text-white mix-blend-overlay">
                   {profileUsername[0]?.toUpperCase() ?? '?'}
                 </span>
               )}
            </div>
            
            {!isOwnProfile && (
              <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-white text-black hover:bg-zinc-200 transition-colors mb-2">
                Follow
              </button>
            )}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight">{profileInfo?.profile?.username || profileUsername}</h1>
            <p className="text-zinc-500 font-medium">@{profileUsername}</p>
            <p className="mt-3 text-zinc-300 text-sm leading-relaxed max-w-sm">
              {profileInfo?.profile?.bio || 'No bio yet.'}
            </p>
          </div>

          <div className="flex gap-6 border-y border-white/5 py-4 mb-6">
            <div className="flex flex-col">
              <span className="text-xl font-black">{followers?.profiles?.length || 0}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black">{following?.profiles?.length || 0}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div
          className="rounded-xl p-1 flex gap-1 mb-2"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all"
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
    </div>
  )
}
