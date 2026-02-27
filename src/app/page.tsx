'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedCard {
  id: number
  tokenSymbol: string
  tokenTicker: string
  tokenPrice: string
  priceChange: string
  isPositive: boolean
  marketCap: string
  isTrending: boolean
  likes: number
  comments: number
  shares: number
  /* Visual theme for each card */
  visual: {
    gradientFrom: string
    gradientTo: string
    glowColor: string
    letter: string
  }
  creator: {
    username: string
    tagline: string
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const CARDS: FeedCard[] = [
  {
    id: 1,
    tokenSymbol: '$SWIPE',
    tokenTicker: 'S',
    tokenPrice: '$0.0042',
    priceChange: '+12.5%',
    isPositive: true,
    marketCap: '$1.2M',
    isTrending: true,
    likes: 12400,
    comments: 842,
    shares: 231,
    visual: {
      gradientFrom: '#0d9488',
      gradientTo: '#2dd4bf',
      glowColor: 'rgba(20,184,166,0.25)',
      letter: 'S',
    },
    creator: { username: 'cryptowizard', tagline: 'Top 3 caller this week' },
  },
  {
    id: 2,
    tokenSymbol: '$PEPE3',
    tokenTicker: 'P',
    tokenPrice: '$0.00013',
    priceChange: '+69.4%',
    isPositive: true,
    marketCap: '$4.8M',
    isTrending: true,
    likes: 8900,
    comments: 1200,
    shares: 540,
    visual: {
      gradientFrom: '#7c3aed',
      gradientTo: '#a78bfa',
      glowColor: 'rgba(124,58,237,0.25)',
      letter: 'P',
    },
    creator: { username: 'moonmaster', tagline: '85% win rate · 89 calls' },
  },
  {
    id: 3,
    tokenSymbol: '$WAGMI',
    tokenTicker: 'W',
    tokenPrice: '$0.00069',
    priceChange: '+1337%',
    isPositive: true,
    marketCap: '$690K',
    isTrending: false,
    likes: 24300,
    comments: 3100,
    shares: 890,
    visual: {
      gradientFrom: '#d97706',
      gradientTo: '#fbbf24',
      glowColor: 'rgba(251,191,36,0.2)',
      letter: 'W',
    },
    creator: { username: 'early_alpha', tagline: 'Legendary · 91% win rate' },
  },
  {
    id: 4,
    tokenSymbol: '$BONK2',
    tokenTicker: 'B',
    tokenPrice: '$0.0000089',
    priceChange: '+233%',
    isPositive: true,
    marketCap: '$8.9M',
    isTrending: true,
    likes: 6200,
    comments: 490,
    shares: 310,
    visual: {
      gradientFrom: '#2563eb',
      gradientTo: '#60a5fa',
      glowColor: 'rgba(37,99,235,0.2)',
      letter: 'B',
    },
    creator: { username: 'solana_degen', tagline: 'Rising · 62% win rate' },
  },
  {
    id: 5,
    tokenSymbol: '$POPCAT2',
    tokenTicker: 'C',
    tokenPrice: '$0.0021',
    priceChange: '+892%',
    isPositive: true,
    marketCap: '$21.3M',
    isTrending: true,
    likes: 15700,
    comments: 2200,
    shares: 670,
    visual: {
      gradientFrom: '#059669',
      gradientTo: '#34d399',
      glowColor: 'rgba(5,150,105,0.2)',
      letter: 'C',
    },
    creator: { username: 'kol_alpha', tagline: 'Expert · 74% win rate' },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  const card = CARDS[currentIdx % CARDS.length]

  const handleSwipe = (dir: 'left' | 'right') => {
    if (exitDir) return
    setExitDir(dir)
    setTimeout(() => {
      setCurrentIdx((p) => (p + 1) % CARDS.length)
      setExitDir(null)
    }, 340)
  }

  return (
    <div
      className="flex flex-col px-4 pt-3 gap-3 overflow-hidden"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── "SWIPE TO DISCOVER" ─────────────────────────────────── */}
      <p className="text-center text-[11px] font-bold tracking-[0.25em] uppercase text-zinc-500 select-none">
        Swipe to Discover
      </p>

      {/* ── Card area ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              x: exitDir === 'left' ? -360 : exitDir === 'right' ? 360 : 0,
              rotate: exitDir === 'left' ? -12 : exitDir === 'right' ? 12 : 0,
              transition: { duration: 0.32, ease: 'easeOut' },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 rounded-[20px] overflow-hidden flex flex-col card-glow"
            style={{
              background: `linear-gradient(180deg, #0c1018 0%, #080810 100%)`,
              border: '1.5px solid rgba(56,189,248,0.15)',
            }}
          >
            {/* ── Token visual (top ~65%) ─────────────────────────── */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              {/* Ambient glow */}
              <div
                className="absolute w-[280px] h-[280px] rounded-full blur-3xl opacity-40"
                style={{
                  background: `radial-gradient(circle, ${card.visual.glowColor} 0%, transparent 70%)`,
                }}
              />

              {/* 3D-style crystal block */}
              <div className="relative float-anim">
                {/* Back face */}
                <div
                  className="absolute -top-3 left-3 w-[140px] h-[140px] rounded-2xl opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${card.visual.gradientFrom}, ${card.visual.gradientTo})`,
                    transform: 'rotate(12deg)',
                  }}
                />
                {/* Main face */}
                <div
                  className="relative w-[140px] h-[140px] rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(150deg, ${card.visual.gradientFrom}, ${card.visual.gradientTo})`,
                    transform: 'rotate(12deg)',
                    boxShadow: `0 20px 60px ${card.visual.glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  }}
                >
                  <span
                    className="text-6xl font-black text-white/20"
                    style={{ transform: 'rotate(-12deg)' }}
                  >
                    {card.visual.letter}
                  </span>
                </div>
                {/* Bottom face (depth) */}
                <div
                  className="absolute top-3 -left-2 w-[140px] h-[140px] rounded-2xl opacity-20"
                  style={{
                    background: card.visual.gradientFrom,
                    transform: 'rotate(12deg)',
                  }}
                />
              </div>

              {/* ── Right-side action buttons (TikTok-style) ──── */}
              <div className="absolute right-3 bottom-4 flex flex-col items-center gap-5">
                {/* Likes */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <Heart size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white/70">
                    {formatCount(card.likes)}
                  </span>
                </button>

                {/* Comments */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white/70">
                    {formatCount(card.comments)}
                  </span>
                </button>

                {/* Share */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <Share2 size={18} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white/70">
                    Share
                  </span>
                </button>
              </div>
            </div>

            {/* ── Token info overlay (bottom) ────────────────────── */}
            <div className="px-4 pb-4 pt-2 space-y-1.5">
              {/* Token name row */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${card.visual.gradientFrom}, ${card.visual.gradientTo})`,
                  }}
                >
                  {card.tokenTicker}
                </div>
                <span className="text-base font-extrabold text-white">
                  {card.tokenSymbol}
                </span>
                {card.isTrending && (
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                    style={{
                      color: '#22c55e',
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.25)',
                    }}
                  >
                    Trending
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-[32px] font-black text-white leading-none tracking-tight">
                {card.tokenPrice}
              </p>

              {/* Change + MCap */}
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="flex items-center gap-0.5 font-bold"
                  style={{ color: card.isPositive ? '#22c55e' : '#ef4444' }}
                >
                  <ArrowUpRight
                    size={14}
                    className={!card.isPositive ? 'rotate-180' : ''}
                  />
                  {card.priceChange}
                </span>
                <span className="text-zinc-500">
                  MCap: {card.marketCap}
                </span>
              </div>

              {/* Creator */}
              <div className="flex items-center gap-2 pt-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #059669)',
                  }}
                >
                  {card.creator.username[0].toUpperCase()}
                </div>
                <span className="text-xs text-zinc-400">
                  <span className="text-zinc-200 font-semibold">
                    @{card.creator.username}
                  </span>{' '}
                  · {card.creator.tagline}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Action buttons ─────────────────────────────────────── */}
      <div className="flex gap-3 flex-shrink-0">
        {/* Skip */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSwipe('left')}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9ca3af',
          }}
        >
          <ChevronLeft size={16} />
          <ChevronLeft size={16} className="-ml-3" />
          Skip
        </motion.button>

        {/* Buy & Follow */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSwipe('right')}
          className="flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 0 24px rgba(34,197,94,0.3)',
          }}
        >
          Buy & Follow
          <ChevronRight size={16} />
          <ChevronRight size={16} className="-ml-3" />
        </motion.button>
      </div>
    </div>
  )
}
