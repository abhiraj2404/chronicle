'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  ChevronLeft,
  Heart,
  Loader2,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// ─── Constants ─────────────────────────────────────────────────────────────────
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const DEFAULT_BUY_SOL = 0.1 // Default buy amount in SOL
const SOL_DECIMALS = 9
const DEFAULT_SLIPPAGE_BPS = 50

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedCard {
  id: number | string
  tokenSymbol: string
  tokenTicker: string
  tokenPrice: string
  priceChange: string
  isPositive: boolean
  marketCap: string
  isTrending: boolean
  /** Solana token contract address */
  tokenCA: string
  /** Token decimals */
  decimals: number
  likes: number
  comments: number
  shares: number
  /** Optional video/image media for immersive background */
  media?: {
    type: 'video' | 'image'
    url: string
  }
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
  description: string
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
    tokenCA: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    decimals: 6,
    likes: 12400,
    comments: 842,
    shares: 231,
    media: { type: 'video', url: '/assets/vid-1.mp4' },
    visual: {
      gradientFrom: '#0d9488',
      gradientTo: '#2dd4bf',
      glowColor: 'rgba(20,184,166,0.25)',
      letter: 'S',
    },
    creator: { username: 'cryptowizard', tagline: 'Top 3 caller this week' },
    description: 'Swipe is the premier layer-2 scaling solution promising lightning fast transactions.',
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
    tokenCA: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 6,
    likes: 8900,
    comments: 1200,
    shares: 540,
    media: { type: 'video', url: '/assets/vid-2.mp4' },
    visual: {
      gradientFrom: '#7c3aed',
      gradientTo: '#a78bfa',
      glowColor: 'rgba(124,58,237,0.25)',
      letter: 'P',
    },
    creator: { username: 'moonmaster', tagline: '85% win rate · 89 calls' },
    description: 'The return of the king. Pepe3 introduces advanced memeomics for maximum fun.',
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
    tokenCA: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 6,
    likes: 24300,
    comments: 3100,
    shares: 890,
    media: { type: 'video', url: '/assets/vid-3.mp4' },
    visual: {
      gradientFrom: '#d97706',
      gradientTo: '#fbbf24',
      glowColor: 'rgba(251,191,36,0.2)',
      letter: 'W',
    },
    creator: { username: 'early_alpha', tagline: 'Legendary · 91% win rate' },
    description: 'We Are All Gonna Make It. A community-driven token with actual utility.',
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
    tokenCA: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 5,
    likes: 6200,
    comments: 490,
    shares: 310,
    media: { type: 'video', url: '/assets/vid-2.mp4' },
    visual: {
      gradientFrom: '#2563eb',
      gradientTo: '#60a5fa',
      glowColor: 'rgba(37,99,235,0.2)',
      letter: 'B',
    },
    creator: { username: 'solana_degen', tagline: 'Rising · 62% win rate' },
    description: 'Bonk 2 is the upgraded ecosystem dog token with zero taxes and burned liquidity.',
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
    tokenCA: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    likes: 15700,
    comments: 2200,
    shares: 670,
    media: { type: 'video', url: '/assets/vid-3.mp4' },
    visual: {
      gradientFrom: '#059669',
      gradientTo: '#34d399',
      glowColor: 'rgba(5,150,105,0.2)',
      letter: 'C',
    },
    creator: { username: 'kol_alpha', tagline: 'Expert · 74% win rate' },
    description: 'Popcat is back. The most explosive gaming token this cycle.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const { walletAddress } = useCurrentWallet()
  const [feedCards, setFeedCards] = useState<FeedCard[]>(CARDS)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Buy Screen State
  const [selectedBuyCard, setSelectedBuyCard] = useState<FeedCard | null>(null)
  const [isExecutingBuy, setIsExecutingBuy] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [amountMode, setAmountMode] = useState<'default' | 'custom'>('default')
  const [customAmount, setCustomAmount] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch live posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/posts${walletAddress ? `?walletAddress=${walletAddress}` : ''}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.posts && Array.isArray(data.posts)) {
          const liveCards: FeedCard[] = data.posts.map((post: any) => {
            const isVideo = post.contentUrl.match(/\.(mp4|webm|ogg)$/i) || post.contentUrl.includes('/video/')
            return {
              id: post._id,
              tokenSymbol: '$UNKNOWN', // Mock since DB doesn't store token symbol yet
              tokenTicker: 'U',
              tokenPrice: '$0.00',
              priceChange: '0%',
              isPositive: true,
              marketCap: 'Unknown',
              isTrending: false,
              tokenCA: post.tokenCA,
              decimals: 6,
              likes: 0,
              comments: 0,
              shares: 0,
              media: { type: isVideo ? 'video' : 'image', url: post.contentUrl },
              visual: {
                gradientFrom: '#3b82f6',
                gradientTo: '#8b5cf6',
                glowColor: 'rgba(59,130,246,0.25)',
                letter: 'U',
              },
              creator: {
                username: post.creatorWallet ? `${post.creatorWallet.slice(0, 4)}...${post.creatorWallet.slice(-4)}` : 'Anonymous',
                tagline: 'New Creator'
              },
              description: post.caption || 'No description provided.',
            }
          })

          setFeedCards(prev => {
            // Filter out any duplicates assuming ID uniqueness
            const existingIds = new Set(prev.map(c => c.id))
            const newCards = liveCards.filter(c => !existingIds.has(c.id))
            return [...prev, ...newCards]
          })
        }
      } catch (e) {
        console.error('Failed to fetch live posts:', e)
      }
    }

    fetchPosts()
  }, [walletAddress])

  const card = feedCards[currentIdx % feedCards.length]
  const hasMedia = !!card.media

  // Auto-play video when card changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    video.play().catch(() => {
      /* autoplay blocked — user must interact first */
    })
  }, [currentIdx])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const advanceCard = useCallback((dir: 'up' | 'down') => {
    if (isAnimating) return;
    setDirection(dir)
    setIsAnimating(true)

    // Slight delay to allow framer motion to sync state
    setTimeout(() => {
      setCurrentIdx((p) => {
        if (dir === 'up') return (p + 1) % feedCards.length;
        return (p - 1 + feedCards.length) % feedCards.length;
      })
      setTimeout(() => setIsAnimating(false), 300) // Unlock interactions after animation
    }, 50)
  }, [isAnimating])

  // ── Open Buy Screen ───────────
  const handleOpenBuyModal = useCallback(() => {
    if (isAnimating) return
    setSelectedBuyCard(card)
    setAmountMode('default')
    setCustomAmount('')
  }, [isAnimating, card])

  const purchaseSolAmount =
    amountMode === 'custom' && customAmount
      ? parseFloat(customAmount)
      : DEFAULT_BUY_SOL

  const isValidPurchaseAmount =
    !isNaN(purchaseSolAmount) && purchaseSolAmount > 0

  // Strip dollar sign and parse numeric value
  const parseTokenPrice = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/[^0-9.]/g, ''))
    return isNaN(num) ? 0 : num
  }

  const tokenPriceNumeric = selectedBuyCard
    ? parseTokenPrice(selectedBuyCard.tokenPrice)
    : 0

  const estimatedTokens =
    tokenPriceNumeric > 0 && isValidPurchaseAmount
      ? (purchaseSolAmount / tokenPriceNumeric).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
      : '0'

  // ── Execute Buy via Jupiter (SOL → token) then advance card ───────────
  const executeBuy = useCallback(async () => {
    if (isExecutingBuy || !selectedBuyCard || !isValidPurchaseAmount) return

    if (!walletAddress) {
      toast.error('Connect your wallet to buy tokens.')
      return
    }

    setIsExecutingBuy(true)

    try {
      /* MOCKING SWAP DUE TO NO MAINNET FUNDS
      // Step 1: Get quote (SOL → token)
      ...
      */

      // 1. Simulate network and signing delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 2. Trigger the GPay-like success animation overlay
      setShowSuccessAnimation(true)

      // 3. Wait 3.5 seconds for animation to fully play out perfectly
      await new Promise(resolve => setTimeout(resolve, 3500))

      toast.success(
        `Successfully bought ${selectedBuyCard.tokenSymbol}!`,
      )

      // Advance to next card after successful buy completion
      setShowSuccessAnimation(false)
      setSelectedBuyCard(null)
      advanceCard('up')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Buy failed'
      toast.error(message)
    } finally {
      setIsExecutingBuy(false)
    }
  }, [isExecutingBuy, walletAddress, selectedBuyCard, advanceCard, purchaseSolAmount, isValidPurchaseAmount])

  const handleAction = (action: 'skip' | 'buy') => {
    if (isAnimating || isExecutingBuy) return
    if (action === 'buy') {
      handleOpenBuyModal()
    } else {
      advanceCard('up')
    }
  }

  return (
    <div
      className="relative flex flex-col px-4 pt-3 gap-3 overflow-hidden max-w-lg mx-auto w-full"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── "SCROLL TO DISCOVER" ─────────────────────────────────── */}
      <p className="text-center text-[11px] font-bold tracking-[0.25em] uppercase text-zinc-500 select-none">
        Scroll to Discover
      </p>

      {/* ── Card area ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <AnimatePresence>
          <motion.div
            key={card.id}
            custom={direction}
            variants={{
              initial: (dir: 'up' | 'down') => ({
                opacity: 0,
                scale: 0.9,
                y: dir === 'up' ? '100%' : '-100%',
              }),
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: (dir: 'up' | 'down') => ({
                opacity: 0,
                scale: 0.9,
                y: dir === 'up' ? '-100%' : '100%',
              }),
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} // smooth spring-like ease
            drag
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={{ top: 0.8, bottom: 0.8, left: 0.1, right: 0.8 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipeY = offset.y;
              const swipeX = offset.x;

              if (Math.abs(swipeX) > Math.abs(swipeY)) {
                // Horizontal Swipe
                if (swipeX > 80 || velocity.x > 500) {
                  handleOpenBuyModal(); // Right swipe triggers buy
                }
              } else {
                // Vertical Swipe
                if (swipeY < -80 || velocity.y < -500) {
                  advanceCard('up'); // Scrolled up (next)
                } else if (swipeY > 80 || velocity.y > 500) {
                  advanceCard('down'); // Scrolled down (prev)
                }
              }
            }}
            className="absolute inset-0 rounded-[20px] overflow-hidden card-glow cursor-grab active:cursor-grabbing z-0"
            style={{
              background: `linear-gradient(180deg, #0c1018 0%, #080810 100%)`,
              border: '1.5px solid rgba(56,189,248,0.15)',
            }}
          >
            {/* ── Full-bleed media background ────────────────────── */}
            {hasMedia && card.media?.type === 'video' && (
              <video
                ref={videoRef}
                src={card.media.url}
                muted={isMuted}
                loop
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {hasMedia && card.media?.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.media.url}
                alt={card.tokenSymbol}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Dark gradient overlay so text stays readable */}
            {hasMedia && (
              <div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(8,8,16,0.75) 75%, rgba(8,8,16,0.95) 100%)',
                }}
              />
            )}

            {/* ── Fallback: crystal block (when no media) ────────── */}
            {!hasMedia && (
              <div className="absolute inset-0 flex items-center justify-center">
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
              </div>
            )}

            {/* ── Right-side action buttons (TikTok-style) ──────── */}
            <div className="absolute right-3 bottom-[140px] flex flex-col items-center gap-5 z-10">
              {/* Mute/Unmute toggle (only for video cards) */}
              {card.media?.type === 'video' && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-white/70">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </span>
                </button>
              )}

              {/* Likes */}
              <button
                type="button"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
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
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
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
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
                >
                  <Share2 size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-white/70">
                  Share
                </span>
              </button>
            </div>

            {/* ── Token info overlay (pinned to bottom) ──────────── */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-6 space-y-1.5 z-10">
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
          disabled={isAnimating || isExecutingBuy}
          onClick={() => handleAction('skip')}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9ca3af',
          }}
        >
          Skip
        </motion.button>

        {/* Buy & Follow */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={isAnimating || isExecutingBuy}
          onClick={() => handleAction('buy')}
          className="flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 0 24px rgba(34,197,94,0.3)',
          }}
        >
          {isExecutingBuy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              Buy & Follow
            </>
          )}
        </motion.button>
      </div>

      {/* ── Sliding Buy Screen ───────────────────────────────────── */}
      <AnimatePresence>
        {selectedBuyCard && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#080810] z-50 flex flex-col"
            style={{
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* ── Top Navigation Bar ── */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0c1018] flex-shrink-0">
              <button
                onClick={() => !isExecutingBuy && setSelectedBuyCard(null)}
                disabled={isExecutingBuy}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-zinc-400 disabled:opacity-50"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-lg font-bold text-white">Buy Token</h2>
              <div className="w-10 h-10 flex flex-col items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white mix-blend-screen"
                  style={{
                    background: `linear-gradient(135deg, ${selectedBuyCard.visual.gradientFrom}, ${selectedBuyCard.visual.gradientTo})`,
                  }}
                >
                  {selectedBuyCard.visual.letter}
                </div>
              </div>
            </div>

            {/* ── Content Area ── */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Token Info Section */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: `linear-gradient(135deg, ${selectedBuyCard.visual.gradientFrom}, ${selectedBuyCard.visual.gradientTo})`,
                    boxShadow: `0 12px 40px ${selectedBuyCard.visual.glowColor}`,
                  }}
                >
                  <span className="text-5xl font-black text-white mix-blend-overlay">
                    {selectedBuyCard.visual.letter}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {selectedBuyCard.tokenSymbol}
                </h3>
                <p className="text-sm font-semibold tracking-wider text-zinc-500 mb-4">
                  {selectedBuyCard.tokenTicker}
                </p>
                <p className="text-sm text-zinc-400 max-w-sm leading-relaxed line-clamp-3">
                  {selectedBuyCard.description}
                </p>
              </div>

              {/* Purchase Amount Selection */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  Select Amount
                </h4>

                <div className="flex bg-[#121824] p-1.5 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setAmountMode('default')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      amountMode === 'default'
                        ? 'bg-zinc-800 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Default ({DEFAULT_BUY_SOL} SOL)
                  </button>
                  <button
                    onClick={() => setAmountMode('custom')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      amountMode === 'custom'
                        ? 'bg-zinc-800 text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                <AnimatePresence>
                  {amountMode === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative pt-2">
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full bg-[#121824] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-2xl font-black text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all font-mono"
                        />
                        <span className="absolute right-6 top-1/2 mt-1 -translate-y-1/2 text-zinc-500 font-bold">
                          SOL
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Real-time Price Estimation Section */}
              <div className="bg-[#121824] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-500">Current Price</span>
                  <span className="text-sm font-bold text-white">{selectedBuyCard.tokenPrice}</span>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-500">You Receive (Est.)</span>
                  <span
                    className="text-lg font-black transition-colors"
                    style={{ color: isValidPurchaseAmount ? '#22c55e' : '#9ca3af' }}
                  >
                    {estimatedTokens} {selectedBuyCard.tokenTicker}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Action Section (Bottom Safe Area) ── */}
            <div className="bg-[#0c1018] border-t border-white/5 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex gap-3 flex-shrink-0">
              <button
                onClick={() => !isExecutingBuy && setSelectedBuyCard(null)}
                disabled={isExecutingBuy}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-white bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={executeBuy}
                disabled={isExecutingBuy || !isValidPurchaseAmount}
                className="flex-[2] py-4 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${selectedBuyCard.visual.gradientFrom}, ${selectedBuyCard.visual.gradientTo})`,
                  boxShadow: isValidPurchaseAmount
                    ? `0 12px 30px ${selectedBuyCard.visual.glowColor}`
                    : 'none',
                }}
              >
                {isExecutingBuy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Executing Buy…
                  </>
                ) : (
                  isValidPurchaseAmount ? 'Confirm Buy' : 'Select Amount'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Animation Overlay (GPay Style) ───────────────── */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#080810]/95 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center">
              {/* Pulse Outer Glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.3, 1], opacity: [0, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-48 h-48 bg-green-500 rounded-full blur-2xl"
              />

              {/* Checkmark Circle Background */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] relative z-10"
              >
                {/* SVG Drawing Checkmark */}
                <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    d="M20 6L9 17l-5-5"
                  />
                </svg>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="mt-8 text-center"
            >
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Purchase Successful</h3>
              <p className="text-green-500 font-bold uppercase tracking-widest text-sm">Secured on Solana</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}