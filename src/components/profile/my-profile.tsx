'use client'

import { CopyPaste } from '@/components/common/copy-paste'
import { Bio } from '@/components/profile/bio'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import { FollowButton } from '@/components/profile/follow-button'
import { motion } from 'framer-motion'
import { Heart, Shield, Star, TrendingUp, User, Zap } from 'lucide-react'
import Image from 'next/image'

interface Props {
  username: string
}

// ─── Tier system ──────────────────────────────────────────────────────────────
interface Tier {
  label: string
  gradient: string
  glowColor: string
  level: number
}

function getTier(followers: number): Tier {
  if (followers >= 10000)
    return {
      label: 'LEGENDARY',
      gradient: 'from-yellow-400 to-orange-500',
      glowColor: 'rgba(251,191,36,0.25)',
      level: Math.min(50 + Math.floor((followers - 10000) / 5000), 99),
    }
  if (followers >= 5000)
    return {
      label: 'MASTER',
      gradient: 'from-purple-500 to-pink-400',
      glowColor: 'rgba(168,85,247,0.2)',
      level: 30 + Math.floor((followers - 5000) / 500),
    }
  if (followers >= 1000)
    return {
      label: 'EXPERT',
      gradient: 'from-blue-500 to-cyan-400',
      glowColor: 'rgba(59,130,246,0.2)',
      level: 15 + Math.floor((followers - 1000) / 400),
    }
  if (followers >= 100)
    return {
      label: 'RISING',
      gradient: 'from-green-500 to-emerald-400',
      glowColor: 'rgba(16,185,129,0.2)',
      level: 5 + Math.floor((followers - 100) / 100),
    }
  return {
    label: 'ROOKIE',
    gradient: 'from-zinc-500 to-zinc-400',
    glowColor: 'rgba(113,113,122,0.15)',
    level: Math.max(1, Math.floor(followers / 10)),
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// ─── Main component ───────────────────────────────────────────────────────────
export function MyProfile({ username }: Props) {
  const { data, refetch } = useGetProfileInfo({ username })

  const followersCount = data?.socialCounts?.followers ?? 0
  const followingCount = data?.socialCounts?.following ?? 0
  const tier = getTier(followersCount)
  const reputation = Math.floor(followersCount * 4.2 + followingCount * 0.8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0e1420 0%, #080810 100%)',
        border: '1.5px solid rgba(56,189,248,0.12)',
        boxShadow: `0 0 32px ${tier.glowColor}`,
      }}
    >
      {/* ── Gradient banner ────────────────────────────────────── */}
      <div
        className="h-20 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(20,184,166,0.08) 50%, rgba(59,130,246,0.06) 100%)',
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }}
        />
        <div
          className="absolute -top-4 right-8 w-16 h-16 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }}
        />
        {/* Tier badge top-right */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${tier.gradient} text-[9px] font-black uppercase tracking-widest text-white`}
            style={{ boxShadow: `0 0 10px ${tier.glowColor}` }}
          >
            <Zap size={7} fill="white" />
            LVL {tier.level} · {tier.label}
          </span>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        {/* Avatar + follow button */}
        <div className="flex items-end justify-between -mt-7 mb-3">
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: '2.5px solid rgba(34,197,94,0.5)',
              boxShadow: `0 0 16px ${tier.glowColor}`,
            }}
          >
            {data?.profile?.image ? (
              <Image
                src={data.profile.image}
                width={56}
                height={56}
                alt="avatar"
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-xl font-black text-white`}
              >
                {username[0]?.toUpperCase() ?? <User size={20} />}
              </div>
            )}
          </div>
          <FollowButton username={username} />
        </div>

        {/* Username + wallet */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-black text-white">@{username}</h2>
            {followersCount >= 1000 && (
              <Shield size={13} fill="#60a5fa" className="text-blue-400" />
            )}
          </div>
          {data?.walletAddress && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">
                {data.walletAddress.slice(0, 6)}...{data.walletAddress.slice(-4)}
              </span>
              <CopyPaste content={data.walletAddress} />
            </div>
          )}
        </div>

        {/* ── Stats grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <MiniStat
            icon={<Star size={12} fill="#fbbf24" className="text-yellow-400" />}
            value={`${(reputation / 1000).toFixed(1)}K`}
            label="Rep"
            color="text-yellow-400"
          />
          <MiniStat
            icon={<TrendingUp size={12} className="text-green-400" />}
            value={formatCount(followersCount)}
            label="Followers"
            color="text-green-400"
          />
          <MiniStat
            icon={<User size={12} className="text-zinc-400" />}
            value={formatCount(followingCount)}
            label="Following"
            color="text-zinc-300"
          />
          <MiniStat
            icon={<Heart size={12} fill="#22c55e" className="text-green-500" />}
            value={formatCount(Math.floor(followersCount * 1.4))}
            label="Buys"
            color="text-green-400"
          />
        </div>

        {/* ── XP bar ──────────────────────────────────────────── */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500 font-mono uppercase tracking-wider">
              Rep Progress
            </span>
            <span className="font-bold gradient-text-green">{tier.label}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((reputation % 10000) / 100, 100)}%`,
              }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
              style={{ boxShadow: `0 0 6px ${tier.glowColor}` }}
            />
          </div>
        </div>

        {/* Bio */}
        <Bio username={username} data={data} refetch={refetch} />
      </div>
    </motion.div>
  )
}

// ─── Mini stat card ───────────────────────────────────────────────────────────
function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}) {
  return (
    <div
      className="rounded-lg p-2 flex flex-col items-center gap-0.5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {icon}
      <span className={`text-xs font-black ${color}`}>{value}</span>
      <span className="text-[8px] text-zinc-600 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
