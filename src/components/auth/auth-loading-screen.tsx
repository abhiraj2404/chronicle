'use client'

import type { AuthStage } from '@/components/auth/auth-provider'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, UserCheck, UserPlus } from 'lucide-react'

interface Props {
  stage: AuthStage
}

const STAGE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; sub?: string }
> = {
  'waiting-wallet': {
    label: 'Setting up wallet…',
    icon: <Loader2 size={20} className="animate-spin text-green-400" />,
  },
  'checking-profile': {
    label: 'Checking profile…',
    icon: <UserCheck size={20} className="text-green-400" />,
  },
  'creating-profile': {
    label: 'Checking profile…',
    icon: <UserCheck size={20} className="text-green-400" />,
    sub: 'Creating profile…',
  },
  redirecting: {
    label: 'All set!',
    icon: <ArrowRight size={20} className="text-green-400" />,
    sub: 'Redirecting…',
  },
}

export function AuthLoadingScreen({ stage }: Props) {
  const config = STAGE_CONFIG[stage]
  if (!config) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080810]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Spinning ring */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.06))',
            border: '1.5px solid rgba(34,197,94,0.15)',
            boxShadow: '0 0 60px rgba(34,197,94,0.08)',
          }}
        >
          <Loader2 size={32} className="animate-spin text-green-500/60" />
        </div>

        {/* Status messages */}
        <div className="flex flex-col items-center gap-2 min-h-[56px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={config.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2"
            >
              {config.icon}
              <span className="text-sm font-semibold text-white">
                {config.label}
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {config.sub && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <UserPlus size={16} className="text-green-400/60" />
                <span className="text-xs text-zinc-500">{config.sub}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
