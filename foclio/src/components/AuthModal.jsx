import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button, Spinner, XIcon } from './ui'

export default function AuthModal({ onClose }) {
  const { signInWithGoogle, signInWithEmail, supabaseReady } = useAuth()
  const [email, setEmail]       = useState('')
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleGoogle() {
    setLoading(true); setError('')
    try { await signInWithGoogle() }
    catch (e) { setError(e.message || 'Google login failed'); setLoading(false) }
  }

  async function handleEmail(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try { await signInWithEmail(email.trim()); setSent(true) }
    catch (e) { setError(e.message || 'Failed to send link') }
    finally { setLoading(false) }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-sm bg-bg-surface border border-bg-border
        rounded-2xl shadow-modal p-6 animate-scale-in">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center
            text-text-muted hover:text-text-primary hover:bg-bg-raised transition-all"
        >
          <XIcon size={12} />
        </button>

        {/* Logo + heading */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center
            shadow-glow mx-auto mb-4">
            <svg width="17" height="17" viewBox="0 0 11 11" fill="#08090a">
              <polygon points="2,1.5 10,5.5 2,9.5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Sign in to Foclio</h2>
          <p className="text-sm text-text-secondary">
            Sync your library &amp; notes across devices.
          </p>
        </div>

        {!supabaseReady ? (
          <div className="py-4 text-center">
            <p className="text-xs text-text-secondary">
              Auth not configured. Add Supabase keys to{' '}
              <code className="font-mono text-accent">.env.local</code>
            </p>
          </div>
        ) : sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm font-medium text-text-primary mb-1">Check your inbox</p>
            <p className="text-xs text-text-secondary">
              Sign-in link sent to{' '}
              <span className="text-text-primary">{email}</span>
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs text-accent hover:underline focus-accent rounded"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google */}
            <Button
              onClick={handleGoogle}
              loading={loading}
              disabled={loading}
              variant="ghost"
              className="w-full mb-3"
            >
              <GoogleLogo />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-bg-border" />
              <span className="text-[11px] text-text-muted">or</span>
              <div className="flex-1 h-px bg-bg-border" />
            </div>

            {/* Email magic link */}
            <form onSubmit={handleEmail} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@email.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm
                  bg-bg-raised border border-bg-border
                  text-text-primary placeholder:text-text-muted
                  outline-none focus:border-accent/40 transition-colors"
              />
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? 'Sending…' : 'Send sign-in link'}
              </Button>
            </form>

            {error && (
              <p className="mt-3 text-xs text-danger text-center">{error}</p>
            )}

            <p className="mt-4 text-center text-[11px] text-text-muted">
              No password · No spam
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.6 2.41v2h2.58c1.51-1.39 2.38-3.44 2.38-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 0 1-7.14-2.52H.96v2.06A8 8 0 0 0 8 16z" fill="#34A853"/>
      <path d="M3.58 9.55A4.8 4.8 0 0 1 3.33 8c0-.54.1-1.06.25-1.55V4.39H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.61l2.62-2.06z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 0 0 8 0 8 8 0 0 0 .96 4.39L3.58 6.45A4.77 4.77 0 0 1 8 3.18z" fill="#EA4335"/>
    </svg>
  )
}
