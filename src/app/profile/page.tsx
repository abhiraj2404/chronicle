'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { usePrivy } from '@privy-io/react-auth'
import { motion } from 'framer-motion'
import { LogIn, Shield, Star, Trophy, User, Zap } from 'lucide-react'
import { ProfileContent } from '@/components/profile/profile-content'

export default function ProfilePage() {
  const { ready, login } = usePrivy()
  const { isAuthenticated, username, walletAddress } = useAuth()

  // While Privy is loading, show nothing briefly
  if (!ready) {
    return null
  }

  // If authenticated, just show the profile right here!
  if (isAuthenticated) {
    // If username is not resolved yet, we can fallback to walletAddress
    const resolvedUsername = username || walletAddress
    if (!resolvedUsername) {
      return (
        <div className="flex items-center justify-center min-h-screen text-white">
          <div className="animate-pulse">Loading Profile...</div>
        </div>
      )
    }

    return (
      <div className="px-4 py-4">
        <ProfileContent username={resolvedUsername} />
      </div>
    )
  }

  // ── Not authenticated — sign-in screen ──────────────────────────────────
  return (
    <div
      className="flex flex-col items-center justify-center px-6 gap-6"
      style={{ minHeight: 'calc(100dvh - 72px)' }}
    >
      {/* Hero visual */}
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

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-black text-white">Connect Wallet</h1>
        <p className="text-sm text-zinc-500 max-w-[260px]">
          Connect your wallet to start building your on-chain reputation
        </p>
      </motion.div>

      {/* Perks preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-[320px] space-y-2"
      >
        {[
          {
            icon: <Star size={14} fill="#fbbf24" className="text-yellow-400" />,
            text: 'Build verifiable reputation as a caller',
          },
          {
            icon: (
              <Trophy size={14} fill="#22c55e" className="text-green-500" />
            ),
            text: 'Compete for the leaderboard top spot',
          },
          {
            icon: <Shield size={14} fill="#60a5fa" className="text-blue-400" />,
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

      {/* Connect Wallet button */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => login()}
        disabled={!ready}
        className="w-full max-w-[320px] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40"
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
