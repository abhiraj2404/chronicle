'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import type { IGetSocialResponse } from '@/models/profile.models'
import { PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, Heart, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Props {
  username: string
}

interface IPost {
  _id: string
  creatorWallet: string
  contentUrl: string
  caption: string
  tokenCA: string
  rightSwipes: number
  createdAt: string
}

const GRADIENTS = [
  'linear-gradient(135deg, #0d9488, #2dd4bf)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #2563eb, #60a5fa)',
]

export function ProfileContent({ username }: Props) {
  const router = useRouter()
  const { username: myUsername, signOut, isAuthenticated, walletAddress } = useAuth()
  
  // Real Profile logic
  const isOwnProfile = !!myUsername && myUsername === username
  const [profileUsername, setProfileUsername] = useState(username)
  const { data: profileInfo } = useGetProfileInfo({ username: profileUsername })

  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<IGetSocialResponse | null>(null)
  const [following, setFollowing] = useState<IGetSocialResponse | null>(null)
  const [posts, setPosts] = useState<IPost[]>([])

  const walletForPosts = (() => {
    try {
      new PublicKey(username)
      return username
    } catch {
      return profileInfo?.walletAddress ?? null
    }
  })()

  const fetchPosts = useCallback(async () => {
    if (!walletForPosts) return
    try {
      const res = await fetch(
        `/api/posts?walletAddress=${encodeURIComponent(walletForPosts)}&byCreator=true`,
      )
      if (!res.ok) return
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch (e) {
      console.error('Failed to fetch profile posts:', e)
    }
  }, [walletForPosts])

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

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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
              <span className="text-xl font-black">{posts.length}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Posts</span>
            </div>
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

      {/* ── Content (posts) ─────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-4">
        {posts.map((post, idx) => {
          const timeAgo = post.createdAt
            ? (() => {
                const d = new Date(post.createdAt)
                const sec = (Date.now() - d.getTime()) / 1000
                if (sec < 60) return 'Just now'
                if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
                if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
                return `${Math.floor(sec / 86400)}d ago`
              })()
            : ''
          const tokenLabel = post.tokenCA ? `$${post.tokenCA.slice(0, 6)}` : '—'
          const gradient = GRADIENTS[idx % GRADIENTS.length]
          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-[#0C1018] border border-white/5 rounded-3xl p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: gradient }}
                  >
                    {tokenLabel[1] ?? '?'}
                  </div>
                  <span className="font-bold text-sm">{tokenLabel}</span>
                </div>
                <span className="text-xs text-zinc-500 font-medium">{timeAgo}</span>
              </div>

              <p className="text-zinc-300 text-sm leading-relaxed mb-4">{post.caption}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Heart size={16} />
                  <span className="text-xs font-bold">{post.rightSwipes ?? 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full ml-auto">
                  <ArrowUpRight size={14} />
                  <span className="text-xs font-black">Token</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
