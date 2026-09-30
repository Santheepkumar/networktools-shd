'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = theme === 'dark'

  return (
    <header className="fixed top-4 left-4 right-4 z-20">
      <nav className="
        mx-auto max-w-7xl
        flex items-center justify-between
        px-4 py-2.5 rounded-2xl
        bg-[#F8FDFF]/90 dark:bg-[#06131F]/90
        backdrop-blur-xl
        border border-[#19D7C1]/20
        shadow-[0_4px_24px_-4px_rgba(25,215,193,0.12)]
      ">
        {/* Logo — switches between light/dark variant */}
        <Link href="/" className="flex items-center gap-0 cursor-pointer hover:opacity-85 transition-opacity">
          {mounted ? (
            <Image
              src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
              alt="StrawHatDevs"
              width={160}
              height={36}
              priority
              className="h-8 w-auto"
            />
          ) : (
            /* Placeholder while mounting to avoid hydration flash */
            <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
          )}
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Network Tools label */}
          <span className="hidden sm:block text-xs font-medium text-muted-foreground px-2.5 py-1 rounded-full border border-border">
            Dev Tools
          </span>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="cursor-pointer rounded-xl h-9 w-9"
            >
              {isDark ? (
                <Sun className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={1.5} />
              )}
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
