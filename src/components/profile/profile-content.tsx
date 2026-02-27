'use client'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronLeft,
  Heart,
  MessageCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  username: string
}

const MOCK_PROFILE = {
  displayName: 'Degen Scholar',
  username: '@degenscholar',
  bio: 'Exploring the frontier of Layer 2s and DeFi primitives. Early backer of $SWIPE and $PEPE3.',
  followers: '0',
  following: '0',
  postsCount: '3',
  avatarGradient: 'linear-gradient(135deg, #10b981, #047857)',
  coverGradient: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
}

const MOCK_POSTS = [
  {
    id: 1,
    timeAgo: '2h ago',
    content: 'Just grabbed a heavy bag of $SWIPE. The new L2 sequencer changes everything.',
    token: '$SWIPE',
    performance: '+142%',
    likes: 342,
    comments: 45,
    gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
  },
  {
    id: 2,
    timeAgo: '5h ago',
    content: 'If you faded $PEPE3, I don\'t know what to tell you. The easiest 5x of the week.',
    token: '$PEPE3',
    performance: '+450%',
    likes: 892,
    comments: 120,
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  },
  {
    id: 3,
    timeAgo: '1d ago',
    content: 'Rotating capital back into majors. The meme cycle is cooling off for the weekend.',
    token: '$SOL',
    performance: '+5%',
    likes: 124,
    comments: 12,
    gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
  },
]

export function ProfileContent({ username }: Props) {
  const router = useRouter()

  return (
    <div
      className="max-w-xl mx-auto min-h-screen text-white pb-24"
      style={{
        background: '#04060A', // Ultra dark background
      }}
    >
      {/* ── Header Area ─────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover Photo */}
        <div
          className="h-48 w-full relative"
          style={{
            background: MOCK_PROFILE.coverGradient,
          }}
        >
          {/* Subtle noise grid overlay */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all z-10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        {/* Avatar & Info */}
        <div className="px-6 relative -mt-16">
          <div className="flex justify-between items-end mb-4">
            <div
              className="w-32 h-32 rounded-3xl border-4 border-[#04060A] flex items-center justify-center shadow-2xl relative"
              style={{ background: MOCK_PROFILE.avatarGradient }}
            >
               <span className="text-5xl font-black text-white mix-blend-overlay">D</span>
            </div>
            
            <button className="px-6 py-2.5 rounded-full font-bold text-sm bg-white text-black hover:bg-zinc-200 transition-colors mb-2">
              Follow
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight">{MOCK_PROFILE.displayName}</h1>
            <p className="text-zinc-500 font-medium">{MOCK_PROFILE.username}</p>
            <p className="mt-3 text-zinc-300 text-sm leading-relaxed max-w-sm">
              {MOCK_PROFILE.bio}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 border-y border-white/5 py-4 mb-6">
            <div className="flex flex-col">
              <span className="text-xl font-black">{MOCK_PROFILE.postsCount}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black">{MOCK_PROFILE.followers}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black">{MOCK_PROFILE.following}</span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="px-4 flex flex-col gap-4">
        {MOCK_POSTS.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-[#0C1018] border border-white/5 rounded-3xl p-5"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                  style={{ background: post.gradient }}
                >
                  {post.token[1]}
                </div>
                <span className="font-bold text-sm">{post.token}</span>
              </div>
              <span className="text-xs text-zinc-500 font-medium">{post.timeAgo}</span>
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
              {post.content}
            </p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <Heart size={16} />
                <span className="text-xs font-bold">{post.likes}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <MessageCircle size={16} />
                <span className="text-xs font-bold">{post.comments}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#22c55e] ml-auto bg-[#22c55e]/10 px-3 py-1 rounded-full">
                <ArrowUpRight size={14} />
                <span className="text-xs font-black">{post.performance}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
