'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  DollarSign,
  Loader2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

// ─── Constants ─────────────────────────────────────────────────────────────────
const SOL_MINT = 'So11111111111111111111111111111111111111112'
const DEFAULT_SLIPPAGE_BPS = 50

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PortfolioAsset {
  id: number
  tokenSymbol: string
  tokenTicker: string
  tokenPrice: string
  priceChange: string
  isPositive: boolean
  marketCap: string
  /** Token contract address on Solana */
  tokenCA: string
  /** Token decimals for amount conversion */
  decimals: number
  /** Raw holding amount (without commas) for sell tx */
  holdingRaw: number
  holdingAmount: string
  holdingValue: string
  swipedAt: string
  callerUsername: string
  visual: {
    gradientFrom: string
    gradientTo: string
  }
}

// ─── Mock right-swiped assets ──────────────────────────────────────────────────
const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  {
    id: 1,
    tokenSymbol: '$SWIPE',
    tokenTicker: 'S',
    tokenPrice: '$0.0042',
    priceChange: '+12.5%',
    isPositive: true,
    marketCap: '$1.2M',
    tokenCA: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    decimals: 6,
    holdingRaw: 238095,
    holdingAmount: '238,095',
    holdingValue: '$1,000.00',
    swipedAt: '2h ago',
    callerUsername: 'cryptowizard',
    visual: { gradientFrom: '#0d9488', gradientTo: '#2dd4bf' },
  },
  {
    id: 2,
    tokenSymbol: '$PEPE3',
    tokenTicker: 'P',
    tokenPrice: '$0.00013',
    priceChange: '+69.4%',
    isPositive: true,
    marketCap: '$4.8M',
    tokenCA: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 6,
    holdingRaw: 7692307,
    holdingAmount: '7,692,307',
    holdingValue: '$1,000.00',
    swipedAt: '5h ago',
    callerUsername: 'moonmaster',
    visual: { gradientFrom: '#7c3aed', gradientTo: '#a78bfa' },
  },
  {
    id: 3,
    tokenSymbol: '$WAGMI',
    tokenTicker: 'W',
    tokenPrice: '$0.00069',
    priceChange: '+1337%',
    isPositive: true,
    marketCap: '$690K',
    tokenCA: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 6,
    holdingRaw: 1449275,
    holdingAmount: '1,449,275',
    holdingValue: '$1,000.00',
    swipedAt: '1d ago',
    callerUsername: 'early_alpha',
    visual: { gradientFrom: '#d97706', gradientTo: '#fbbf24' },
  },
  {
    id: 4,
    tokenSymbol: '$BONK2',
    tokenTicker: 'B',
    tokenPrice: '$0.0000089',
    priceChange: '+233%',
    isPositive: true,
    marketCap: '$8.9M',
    tokenCA: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 5,
    holdingRaw: 112359550,
    holdingAmount: '112,359,550',
    holdingValue: '$1,000.00',
    swipedAt: '2d ago',
    callerUsername: 'solana_degen',
    visual: { gradientFrom: '#2563eb', gradientTo: '#60a5fa' },
  },
  {
    id: 5,
    tokenSymbol: '$POPCAT2',
    tokenTicker: 'C',
    tokenPrice: '$0.0021',
    priceChange: '+892%',
    isPositive: true,
    marketCap: '$21.3M',
    tokenCA: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    decimals: 6,
    holdingRaw: 476190,
    holdingAmount: '476,190',
    holdingValue: '$1,000.00',
    swipedAt: '3d ago',
    callerUsername: 'kol_alpha',
    visual: { gradientFrom: '#059669', gradientTo: '#34d399' },
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const totalPortfolioValue = '$5,000.00'
const totalPnL = '+$2,340.50'
const totalPnLPercent = '+46.8%'

// ─── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { walletAddress } = useCurrentWallet()
  const [sellingId, setSellingId] = useState<number | null>(null)

  const handleSell = useCallback(
    async (asset: PortfolioAsset) => {
      if (!walletAddress) {
        toast.error('Connect your wallet to sell tokens.')
        return
      }

      setSellingId(asset.id)

      try {
        // Step 1: Get a quote from Jupiter (token → SOL)
        const sellAmountRaw = Math.floor(
          asset.holdingRaw * Math.pow(10, asset.decimals),
        )

        const quoteUrl = `/api/jupiter/quote?inputMint=${asset.tokenCA}&outputMint=${SOL_MINT}&amount=${sellAmountRaw}&slippageBps=${DEFAULT_SLIPPAGE_BPS}`

        const quoteRes = await fetch(quoteUrl)
        const quoteData = await quoteRes.json()

        if (!quoteRes.ok || quoteData.error) {
          throw new Error(quoteData.error || 'Failed to fetch sell quote')
        }

        // Step 2: Build the swap transaction
        const swapRes = await fetch('/api/jupiter/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteResponse: quoteData,
            walletAddress,
            mintAddress: SOL_MINT,
            slippageMode: 'auto',
            slippageBps: DEFAULT_SLIPPAGE_BPS,
          }),
        })

        const swapData = await swapRes.json()

        if (swapData.error) {
          throw new Error(swapData.error)
        }

        toast.success(
          `Sell transaction ready for ${asset.tokenSymbol}! Sign in your wallet to confirm.`,
        )

        /*
          Step 3: In production you would deserialize, sign with wallet, and send:
          
          const { VersionedTransaction } = await import('@solana/web3.js')
          const tx = VersionedTransaction.deserialize(
            Buffer.from(swapData.transaction, 'base64')
          )
          const signedTx = await wallet.signTransaction(tx)
          const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!)
          const sig = await connection.sendRawTransaction(signedTx.serialize())
          await connection.confirmTransaction(sig, 'confirmed')
        */
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sell failed'
        toast.error(message)
      } finally {
        setSellingId(null)
      }
    },
    [walletAddress],
  )

  return (
    <div
      className="flex flex-col px-4 pt-4 gap-5 overflow-y-auto no-scrollbar max-w-lg mx-auto w-full"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Portfolio</h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: 'rgba(34,197,94,0.1)',
            color: '#22c55e',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <TrendingUp size={13} />
          {totalPnLPercent}
        </div>
      </div>

      {/* ── Portfolio summary card ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl p-5"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(20,184,166,0.06) 100%)',
          border: '1px solid rgba(34,197,94,0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)' }}
          >
            <Wallet size={16} className="text-green-400" />
          </div>
          <span className="text-sm text-zinc-400 font-medium">
            Total Value
          </span>
        </div>

        <p className="text-3xl font-black text-white leading-none tracking-tight">
          {totalPortfolioValue}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="flex items-center gap-0.5 text-sm font-bold text-green-400">
            <ArrowUpRight size={14} />
            {totalPnL}
          </span>
          <span className="text-xs text-zinc-500">All time</span>
        </div>
      </motion.div>

      {/* ── Section label ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-[0.15em] uppercase text-zinc-500">
          Right-Swiped Tokens
        </p>
        <p className="text-xs text-zinc-600">
          {PORTFOLIO_ASSETS.length} assets
        </p>
      </div>

      {/* ── Asset list ─────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-3 pb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {PORTFOLIO_ASSETS.map((asset) => {
          const isSelling = sellingId === asset.id

          return (
            <motion.div key={asset.id} variants={itemVariants}>
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Token icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${asset.visual.gradientFrom}, ${asset.visual.gradientTo})`,
                  }}
                >
                  {asset.tokenTicker}
                </div>

                {/* Token name + caller */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {asset.tokenSymbol}
                    </span>
                    <span
                      className="flex items-center gap-0.5 text-xs font-bold shrink-0"
                      style={{
                        color: asset.isPositive ? '#22c55e' : '#ef4444',
                      }}
                    >
                      <ArrowUpRight
                        size={11}
                        className={!asset.isPositive ? 'rotate-180' : ''}
                      />
                      {asset.priceChange}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    via @{asset.callerUsername} · {asset.swipedAt}
                  </p>
                </div>

                {/* Holding value + Sell button */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {asset.holdingValue}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {asset.holdingAmount}
                    </p>
                  </div>

                  {/* Sell button — calls Jupiter quote → swap API */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    disabled={isSelling}
                    onClick={() => handleSell(asset)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    {isSelling ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <DollarSign size={12} />
                    )}
                    {isSelling ? 'Selling…' : 'Sell'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
