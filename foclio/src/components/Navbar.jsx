import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { IconButton, SunIcon, MoonIcon, UserIcon, LogOutIcon } from './ui'

export default function Navbar({ isDark, onToggleTheme, onAuthClick }) {
  const { user, isGuest, signOut, supabaseReady } = useAuth()

  return (
    <header className="sticky top-0 z-40 h-12 flex items-center justify-between
      px-4 sm:px-6 border-b border-bg-border bg-bg-base/90
      backdrop-blur-md backdrop-saturate-150 flex-shrink-0">

      {/* Logo */}
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 group focus-accent rounded-lg px-1"
        aria-label="Foclio home"
      >
        <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center
          shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="#08090a">
            <polygon points="2,1.5 10,5.5 2,9.5" />
          </svg>
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-text-primary">
          foclio<span className="text-accent">.</span>
        </span>
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <IconButton onClick={onToggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </IconButton>

        {/* Auth */}
        {supabaseReady && (
          isGuest ? (
            <button
              onClick={onAuthClick}
              className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-medium text-text-secondary border border-bg-border
                hover:border-accent/40 hover:text-text-primary
                transition-all duration-200 focus-accent"
            >
              <UserIcon size={13} />
              Sign in
            </button>
          ) : (
            <div className="ml-1 flex items-center gap-2">
              {/* Avatar circle */}
              <div className="w-7 h-7 rounded-full bg-accent-dim border border-accent-border
                flex items-center justify-center text-[11px] font-mono text-accent">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <IconButton onClick={signOut} title="Sign out" variant="ghost">
                <LogOutIcon size={14} />
              </IconButton>
            </div>
          )
        )}
      </div>
    </header>
  )
}
