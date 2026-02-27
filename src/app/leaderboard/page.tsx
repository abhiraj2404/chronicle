'use client'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Crown,
  Flame,
  Medal,
  Shield,
  Star,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeFilter = 'all' | 'week' | 'today'

interface LeaderEntry {
  rank: number
  username: string
  tier: string
  tierGradient: string
  reputation: number
  totalCalls: number
  winRate: number
  weeklyChange: number
  bestCall: { token: string; gain: string }
  verified: boolean
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const ENTRIES: LeaderEntry[] = [
  {
    rank: 1,
    username: 'early_alpha',
    tier: 'LEGENDARY',
    tierGradient: 'from-yellow-400 to-orange-500',
    reputation: 24000,
    totalCalls: 201,
    winRate: 91,
    weeklyChange: 0,
    bestCall: { token: '$WAGMI', gain: '+1337%' },
    verified: true,
  },
  {
    rank: 2,
    username: 'moonmaster',
    tier: 'MASTER',
    tierGradient: 'from-purple-500 to-pink-400',
    reputation: 14500,
    totalCalls: 89,
    winRate: 85,
    weeklyChange: 1,
    bestCall: { token: '$PEPE3', gain: '+800%' },
    verified: true,
  },
  {
    rank: 3,
    username: 'cryptowizard',
    tier: 'EXPERT',
    tierGradient: 'from-blue-500 to-cyan-400',
    reputation: 9200,
    totalCalls: 142,
    winRate: 78,
    weeklyChange: -1,
    bestCall: { token: '$DOGE2', gain: '+420%' },
    verified: false,
  },
  {
    rank: 4,
    username: 'kol_alpha',
    tier: 'EXPERT',
    tierGradient: 'from-blue-500 to-cyan-400',
    reputation: 11200,
    totalCalls: 156,
    winRate: 74,
    weeklyChange: 2,
    bestCall: { token: '$POPCAT2', gain: '+892%' },
    verified: true,
  },
  {
    rank: 5,
    username: 'whale_watcher',
    tier: 'MASTER',
    tierGradient: 'from-purple-500 to-pink-400',
    reputation: 16800,
    totalCalls: 74,
    winRate: 82,
    weeklyChange: 0,
    bestCall: { token: '$BONK2', gain: '+500%' },
    verified: true,
  },
  {
    rank: 6,
    username: 'solana_degen',
    tier: 'RISING',
    tierGradient: 'from-green-500 to-emerald-400',
    reputation: 4200,
    totalCalls: 34,
    winRate: 62,
    weeklyChange: 3,
    bestCall: { token: '$BONK2', gain: '+233%' },
    verified: false,
  },
  {
    rank: 7,
    username: 'nfa_nfa',
    tier: 'RISING',
    tierGradient: 'from-green-500 to-emerald-400',
    reputation: 3100,
    totalCalls: 28,
    winRate: 68,
    weeklyChange: 1,
    bestCall: { token: '$ELON', gain: '+300%' },
    verified: false,
  },
  {
    rank: 8,
    username: 'pumpmaster3k',
    tier: 'ROOKIE',
    tierGradient: 'from-zinc-500 to-zinc-400',
    reputation: 1200,
    totalCalls: 15,
    winRate: 53,
    weeklyChange: 5,
    bestCall: { token: '$MEW', gain: '+180%' },
    verified: false,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRep(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()
}

const MEDAL_COLORS = ['#fbbf24', '#9ca3af', '#ea580c'] as const

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [filter, setFilter] = useState<TimeFilter>('all')

  const top3 = ENTRIES.slice(0, 3)
  const rest = ENTRIES.slice(3)
  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'today', label: 'Today' },
  ]

  return (
    <div
      className="flex flex-col px-4 pt-4 pb-4 gap-5 no-scrollbar overflow-y-auto"
      style={{ minHeight: 'calc(100dvh - 72px)' }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Trophy size={24} fill="#fbbf24" className="text-yellow-400" />
          <h1 className="text-2xl font-black tracking-tight gradient-text-green">
            LEADERBOARD
          </h1>
        </div>
        <p className="text-xs text-zinc-500">
          Top callers ranked by on-chain reputation
        </p>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────── */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {filters.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
            style={
              filter === key
                ? {
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: '#fff',
                    boxShadow: '0 0 16px rgba(34,197,94,0.25)',
                  }
                : { color: '#6b7280' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Podium (top 3) ─────────────────────────────────────── */}
      <div className="flex items-end justify-center gap-3 pt-2">
        {/* Render order: 2nd · 1st · 3rd */}
        {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
          const podiumOrder = [2, 1, 3][visualIdx]
          const isFirst = podiumOrder === 1
          const medalColor = MEDAL_COLORS[podiumOrder - 1]
          const pedestalH = isFirst
            ? 'h-24'
            : podiumOrder === 2
              ? 'h-16'
              : 'h-12'
          const avatarSize = isFirst
            ? 'w-14 h-14 text-xl'
            : 'w-11 h-11 text-base'

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visualIdx * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              {/* Medal icon */}
              {isFirst ? (
                <Crown
                  size={20}
                  fill={medalColor}
                  style={{ color: medalColor }}
                />
              ) : (
                <Medal
                  size={16}
                  fill={medalColor}
                  style={{ color: medalColor }}
                />
              )}

              {/* Avatar */}
              <div
                className={`${avatarSize} rounded-full bg-gradient-to-br ${entry.tierGradient} flex items-center justify-center font-black text-white`}
                style={{ boxShadow: `0 0 16px ${medalColor}40` }}
              >
                {entry.username[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="text-center">
                <p className="text-xs font-bold text-white leading-none">
                  @{entry.username}
                </p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Star size={9} fill="#fbbf24" className="text-yellow-400" />
                  <span className="text-[10px] font-bold text-yellow-400">
                    {formatRep(entry.reputation)}
                  </span>
                </div>
              </div>

              {/* Pedestal */}
              <div
                className={`${pedestalH} w-full rounded-t-xl flex items-start justify-center pt-2 overflow-hidden relative`}
                style={{
                  background: `linear-gradient(180deg, rgba(14,20,32,0.9) 0%, rgba(8,8,16,0.7) 100%)`,
                  border: `1px solid ${medalColor}30`,
                  boxShadow: `0 -4px 20px ${medalColor}15`,
                }}
              >
                <span
                  className="text-lg font-black"
                  style={{ color: medalColor }}
                >
                  #{podiumOrder}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Rankings list ───────────────────────────────────────── */}
      <div className="space-y-2">
        {rest.map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {/* Rank */}
            <div className="flex items-center gap-1 w-8">
              <span className="text-sm font-black text-zinc-500">
                {entry.rank}
              </span>
              {entry.weeklyChange > 0 && (
                <ArrowUpRight size={9} className="text-emerald-500" />
              )}
            </div>

            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${entry.tierGradient} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}
            >
              {entry.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate">
                  @{entry.username}
                </p>
                {entry.verified && (
                  <Shield
                    size={10}
                    fill="#60a5fa"
                    className="text-blue-400 flex-shrink-0"
                  />
                )}
              </div>
              <p className="text-[10px] text-zinc-500">
                {entry.totalCalls} calls · Best: {entry.bestCall.token}{' '}
                <span className="text-emerald-400 font-bold">
                  {entry.bestCall.gain}
                </span>
              </p>
            </div>

            {/* Win rate + Rep */}
            <div className="text-right flex-shrink-0">
              <p
                className="text-sm font-black"
                style={{
                  color:
                    entry.winRate >= 80
                      ? '#34d399'
                      : entry.winRate >= 65
                        ? '#fbbf24'
                        : '#fb923c',
                }}
              >
                {entry.winRate}%
              </p>
              <div className="flex items-center justify-end gap-0.5">
                <Star size={8} fill="#fbbf24" className="text-yellow-400" />
                <span className="text-[10px] text-yellow-400 font-bold">
                  {formatRep(entry.reputation)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <div className="text-center py-2 space-y-3">
        <p className="text-xs text-zinc-600">
          Think you can do better? Start calling.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            boxShadow: '0 0 20px rgba(34,197,94,0.3)',
          }}
        >
          <Flame size={14} fill="white" />
          Start Swiping
        </Link>
      </div>
    </div>
  )
}
