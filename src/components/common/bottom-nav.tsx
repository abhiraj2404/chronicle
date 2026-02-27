'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import {
  Flame,
  LayoutGrid,
  PlusCircle,
  Trophy,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
  label: string
}

export function BottomNav() {
  const pathname = usePathname()
  const { walletAddress } = useCurrentWallet()
  const { profiles } = useGetProfiles({ walletAddress: walletAddress || '' })
  const mainUsername = profiles?.[0]?.profile?.username

  const profileHref = mainUsername ? `/${mainUsername}` : '/profile'

  const navItems: NavItem[] = [
    {
      href: '/',
      icon: <Flame size={22} />,
      activeIcon: <Flame size={22} fill="currentColor" />,
      label: 'Feed',
    },
    {
      href: '/trade',
      icon: <PlusCircle size={22} />,
      activeIcon: <PlusCircle size={22} fill="currentColor" />,
      label: 'Create',
    },
    {
      href: '/leaderboard',
      icon: <Trophy size={22} />,
      activeIcon: <Trophy size={22} fill="currentColor" />,
      label: 'Leaders',
    },
    {
      href: '/token',
      icon: <LayoutGrid size={22} />,
      activeIcon: <LayoutGrid size={22} fill="currentColor" />,
      label: 'Portfolio',
    },
    {
      href: profileHref,
      icon: <User size={22} />,
      activeIcon: <User size={22} fill="currentColor" />,
      label: 'Profile',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: 'linear-gradient(180deg, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.98) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {navItems.map(({ href, icon, activeIcon, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors"
              style={{ color: active ? '#22c55e' : '#4b5563' }}
            >
              {active ? activeIcon : icon}
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? '#22c55e' : '#4b5563' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
