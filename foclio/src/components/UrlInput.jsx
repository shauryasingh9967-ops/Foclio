import React, { useEffect, useRef, useState } from 'react'
import { detectVideo } from '../utils/video'
import { Button, Spinner } from './ui'

export default function UrlInput({ onLoad }) {
  const [value, setValue]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit(raw) {
    const url = (raw ?? value).trim()
    setError('')

    if (!url) { setError('Paste a video URL to get started.'); return }

    const result = detectVideo(url)
    if (result.error) { setError(result.error); return }
    if (!result.id)   { setError('Could not parse this URL.'); return }

    setLoading(true)
    // Small delay so skeleton feels intentional, not broken
    setTimeout(() => {
      setLoading(false)
      onLoad({ ...result, rawUrl: url })
    }, 300)
  }

  // Auto-submit on paste if URL is valid
  function onPaste(e) {
    const pasted = e.clipboardData?.getData('text') || ''
    if (!pasted.trim()) return
    setValue(pasted)
    setError('')
    setTimeout(() => {
      const r = detectVideo(pasted.trim())
      if (r.id && !r.error) {
        setLoading(true)
        setTimeout(() => { setLoading(false); onLoad({ ...r, rawUrl: pasted.trim() }) }, 300)
      }
    }, 0)
  }

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-up">
      {/* Hero headline */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
          bg-accent-dim border border-accent-border text-accent text-xs font-mono
          mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
          Your video learning space
        </div>
        <h1 className="text-[2.6rem] sm:text-5xl font-semibold leading-[1.08]
          tracking-tight text-text-primary mb-4">
          Watch. Note.<br />
          <span className="text-gradient">Remember.</span>
        </h1>
        <p className="text-text-secondary text-base leading-relaxed max-w-sm mx-auto">
          Paste any YouTube link. Take timestamped notes,
          build your library, and actually retain what you watch.
        </p>
      </div>

      {/* Input card */}
      <div className="relative">
        {/* Glow ring on focus */}
        <div className="absolute -inset-px rounded-2xl opacity-0 focus-within:opacity-100
          transition-opacity duration-400 pointer-events-none
          bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 blur-sm" />

        <div className="relative flex gap-2 p-2 rounded-2xl
          bg-bg-surface border border-bg-border shadow-card">

          {/* Link icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-10 pl-1
            text-text-muted">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.535 3.535 0 0 0-5-5L7.5 3.5" />
              <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.535 3.535 0 0 0 5 5L8.5 12.5" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={e => { setValue(e.target.value); setError('') }}
            onPaste={onPaste}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Paste a YouTube link…"
            autoComplete="off"
            spellCheck="false"
            className="flex-1 min-w-0 bg-transparent border-none outline-none py-2
              text-sm text-text-primary placeholder:text-text-muted"
          />

          {/* Clear */}
          {value && !loading && (
            <button
              onClick={() => { setValue(''); setError(''); inputRef.current?.focus() }}
              className="flex-shrink-0 w-7 h-7 my-auto rounded-lg flex items-center justify-center
                text-text-muted hover:text-text-primary hover:bg-bg-raised transition-all"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" />
              </svg>
            </button>
          )}

          <Button onClick={() => submit()} loading={loading} disabled={loading} size="md">
            {!loading && (
              <>
                Watch
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                  <polygon points="2,2 11,6.5 2,11" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-danger-dim border border-danger/20 animate-fade-down">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
            stroke="currentColor" strokeWidth="1.5" className="text-danger flex-shrink-0">
            <path d="M6.5 2l5.5 9.5h-11L6.5 2z" />
            <path d="M6.5 5.5v2.5M6.5 9.5v.5" />
          </svg>
          <span className="text-xs text-danger">{error}</span>
        </div>
      )}

      {/* Supported platforms */}
      <div className="mt-5 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <svg width="13" height="9" viewBox="0 0 14 10" fill="currentColor" opacity="0.6">
            <path d="M13.6 1.56A1.76 1.76 0 0 0 12.36.3C11.28 0 7 0 7 0S2.72 0 1.64.3A1.76 1.76 0 0 0 .4 1.56C0 2.6 0 4.8 0 4.8s0 2.2.4 3.24A1.76 1.76 0 0 0 1.64 9.3C2.72 9.6 7 9.6 7 9.6s4.28 0 5.36-.3a1.76 1.76 0 0 0 1.24-1.26C14 7 14 4.8 14 4.8s0-2.2-.4-3.24zM5.6 6.8V2.8l3.6 2-3.6 2z" />
          </svg>
          YouTube
        </div>
        <span className="text-bg-muted text-xs">·</span>
        <div className="flex items-center gap-1.5 text-text-muted text-xs">
          <svg width="13" height="11" viewBox="0 0 14 12" fill="currentColor" opacity="0.5">
            <path d="M4.9 0L0 8.3h4.6l4.9-8.3H4.9zM9.5 0L14 8.3H9.4L7 4.2 9.5 0zM0 8.3L2.3 12H11.7L14 8.3H0z" />
          </svg>
          Google Drive
        </div>
      </div>
    </div>
  )
}
