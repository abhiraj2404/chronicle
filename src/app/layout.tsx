import { BottomNav } from '@/components/common/bottom-nav'
import { PrivyClientProvider } from '@/components/provider/PrivyClientProvider'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEMEX — Tinder for Memecoins',
  description:
    'Swipe on memecoin pitches, auto-buy your favourites, and follow top on-chain callers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MEMEX',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080810',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-[#080810] text-white antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PrivyClientProvider>
            <Toaster />
            {/* Main content area — bottom padding for fixed nav */}
            <main className="pb-[72px]">{children}</main>
            <BottomNav />
          </PrivyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
