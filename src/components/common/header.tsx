'use client'

import { Button } from '@/components/common/button'
import { abbreviateWalletAddress } from '@/components/common/tools'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import {
  Check,
  Clipboard,
  Flame,
  LogIn,
  LogOut,
  Menu,
  Trophy,
  User,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'

export function Header() {
  const { walletAddress } = useCurrentWallet()
  const [mainUsername, setMainUsername] = useState<string | null>(null)
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const { profiles } = useGetProfiles({
    walletAddress: walletAddress || '',
  })
  const { ready, authenticated, logout } = usePrivy()
  const { login } = useLogin()
  const disableLogin = !ready || (ready && authenticated)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        (dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        return
      }
      setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (profiles && profiles.length) {
      setMainUsername(profiles[0].profile.username)
    }
    if (isProfileCreated && profileUsername) {
      setMainUsername(profileUsername)
      setIsProfileCreated(false)
      setProfileUsername(null)
    }
  }, [profiles, isProfileCreated, profileUsername])

  return (
    <>
      <div
        className="border-b border-zinc-800/60 w-full"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,9,11,0.98) 0%, rgba(9,9,11,0.92) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                boxShadow: '0 0 16px rgba(147,51,234,0.5)',
              }}
            >
              <Flame size={14} fill="white" className="text-white" />
            </div>
            <span
              className="text-lg font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MEMEX
            </span>
            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase hidden sm:block">
              · tinder for memecoins
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <NavLink href="/" icon={<Flame size={14} />} label="Discover" />
            <NavLink
              href="/leaderboard"
              icon={<Trophy size={14} />}
              label="Leaderboard"
              accent
            />
            <NavLink href="/token" icon={<Zap size={14} />} label="Tokens" />

            {/* Auth section */}
            <div className="ml-2 flex items-center gap-2">
              {ready && authenticated ? (
                mainUsername ? (
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 h-8 px-3 rounded-lg border border-zinc-800 hover:border-purple-600/50 transition-all text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-[10px] font-black">
                        {mainUsername[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-xs max-w-[80px] truncate">
                        {mainUsername}
                      </span>
                      <Menu size={12} className="text-zinc-500" />
                    </Button>

                    {isDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-800 overflow-hidden z-50"
                        style={{
                          background: 'rgba(18,18,24,0.98)',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        }}
                      >
                        <div className="border-b border-zinc-800">
                          <button
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-xs text-zinc-400 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                            onClick={() => handleCopy(walletAddress)}
                          >
                            {copied ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Clipboard size={13} />
                            )}
                            {abbreviateWalletAddress({ address: walletAddress })}
                          </button>
                        </div>
                        <button
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                          onClick={() => {
                            router.push(`/${mainUsername}`)
                            setIsDropdownOpen(false)
                          }}
                        >
                          <User size={13} />
                          My Profile
                        </button>
                        <button
                          type="button"
                          className="w-full px-4 py-2.5 text-left text-xs text-red-400 hover:bg-zinc-800/50 flex items-center gap-2 transition-colors"
                          onClick={logout}
                        >
                          <LogOut size={13} />
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <CreateProfileContainer
                    setIsProfileCreated={setIsProfileCreated}
                    setProfileUsername={setProfileUsername}
                  />
                )
              ) : (
                <button
                  type="button"
                  disabled={disableLogin}
                  onClick={() =>
                    login({
                      loginMethods: ['wallet'],
                      walletChainType: 'ethereum-and-solana',
                      disableSignup: false,
                    })
                  }
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                    boxShadow: '0 0 16px rgba(147,51,234,0.35)',
                  }}
                >
                  <LogIn size={13} />
                  Connect
                </button>
              )}

              <DialectNotificationComponent />

              <a
                href="https://github.com/Primitives-xyz/solana-starter-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 flex items-center transition-opacity"
              >
                <Image
                  width={18}
                  height={18}
                  alt="Github link"
                  src="/logos/github-mark.svg"
                  className="invert opacity-40 hover:opacity-70 transition-opacity"
                />
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

// ── Sub-component: nav link ─────────────────────────────────────────
interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  accent?: boolean
}

function NavLink({ href, icon, label, accent = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-all hover:bg-zinc-800/60"
      style={
        accent
          ? {
              color: '#c084fc',
            }
          : { color: '#a1a1aa' }
      }
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </Link>
  )
}
