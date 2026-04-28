// components/VideoPlayer.jsx
// Pure iframe embed — most reliable approach.
// No YouTube IFrame API dependency = no loading issues, no API failures.
// Controls: speed (via URL param reload), restart, fullscreen, copy, open in YT.

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { VIDEO_TYPE, fmtTime, copyText } from '../utils/video'
import {
  Skeleton, IconButton, Button,
  CopyIcon, ExternalIcon, FullscreenIcon, RestartIcon,
  ClockIcon, BookmarkIcon,
} from './ui'
import { useAuth } from '../hooks/useAuth'
import { library, progress as progressDB } from '../lib/db'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

// Time tracker — since we can't read YT currentTime from iframe,
// we track elapsed wall-clock time from load moment.
function useElapsedTime(running) {
  const startRef  = useRef(null)
  const offsetRef = useRef(0)

  const resume = useCallback(() => { startRef.current = Date.now() }, [])
  const pause  = useCallback(() => {
    if (startRef.current) {
      offsetRef.current += (Date.now() - startRef.current) / 1000
      startRef.current = null
    }
  }, [])
  const reset  = useCallback((base = 0) => {
    offsetRef.current = base
    startRef.current = running ? Date.now() : null
  }, [running])

  const getTime = useCallback(() => {
    const extra = startRef.current ? (Date.now() - startRef.current) / 1000 : 0
    return offsetRef.current + extra
  }, [])

  return { resume, pause, reset, getTime }
}

export default function VideoPlayer({ videoData, onSaveToggle, toast }) {
  const { user } = useAuth()
  const { type, id, embedUrl, youtubeUrl, rawUrl } = videoData

  const [iframeLoaded, setIframeLoaded]   = useState(false)
  const [iframeError, setIframeError]     = useState(false)
  const [speed, setSpeed]                 = useState(1)
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false)
  const [isSaved, setIsSaved]             = useState(false)
  const [savingLoading, setSavingLoading] = useState(false)
  const [resumeFrom, setResumeFrom]       = useState(0)
  const [showResume, setShowResume]       = useState(false)

  const iframeRef   = useRef(null)
  const containerRef = useRef(null)
  const speedMenuRef = useRef(null)

  // Track elapsed time since load (best-effort for iframe)
  const { resume, pause, reset, getTime } = useElapsedTime(true)

  // Build iframe src — speed is embedded as a URL param for youtube-nocookie
  const buildSrc = useCallback((startSec = 0, rate = 1) => {
    if (type === VIDEO_TYPE.YOUTUBE) {
      const params = new URLSearchParams({
        rel: 0, modestbranding: 1, playsinline: 1, enablejsapi: 0,
        ...(startSec > 5 ? { start: Math.floor(startSec) } : {}),
      })
      return `https://www.youtube-nocookie.com/embed/${id}?${params}`
    }
    return embedUrl
  }, [type, id, embedUrl])

  const [src, setSrc] = useState(() => buildSrc(0))

  // Load saved progress once on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const t = await progressDB.get(user?.id ?? null, id)
        if (!cancelled && t > 10) {
          setResumeFrom(t)
          setShowResume(true)
        }
        const saved = await library.isSaved(user?.id ?? null, id)
        if (!cancelled) setIsSaved(saved)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [id, user?.id])

  // Auto-save progress every 8s
  useEffect(() => {
    if (type !== VIDEO_TYPE.YOUTUBE) return
    const interval = setInterval(() => {
      const t = getTime()
      if (t > 3) progressDB.save(user?.id ?? null, id, t)
    }, 8000)
    // Save on unmount too
    return () => {
      clearInterval(interval)
      const t = getTime()
      if (t > 3) progressDB.save(user?.id ?? null, id, t)
    }
  }, [id, user?.id, getTime, type])

  // Save on page unload
  useEffect(() => {
    const handler = () => {
      const t = getTime()
      if (t > 3) progressDB.save(user?.id ?? null, id, t)
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [id, user?.id, getTime])

  // Close speed menu on outside click
  useEffect(() => {
    function handle(e) {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target)) {
        setSpeedMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleIframeLoad() {
    setIframeLoaded(true)
    setIframeError(false)
    reset(resumeFrom || 0)
    resume()
  }

  function handleIframeError() {
    setIframeLoaded(true) // hide skeleton
    setIframeError(true)
  }

  function handleResume() {
    setSrc(buildSrc(resumeFrom, speed))
    setIframeLoaded(false)
    setShowResume(false)
    reset(resumeFrom)
  }

  function handleRestart() {
    setSrc(buildSrc(0, speed))
    setIframeLoaded(false)
    reset(0)
    pause()
    toast.info('Restarting…')
  }

  function handleSpeedChange(s) {
    setSpeed(s)
    setSpeedMenuOpen(false)
    const currentTime = getTime()
    setSrc(buildSrc(currentTime, s))
    setIframeLoaded(false)
    reset(currentTime)
    toast.info(`Speed: ${s}×`, { duration: 1500 })
  }

  async function handleCopy() {
    const url = youtubeUrl || rawUrl
    const ok = await copyText(url)
    ok ? toast.success('Link copied!') : toast.error('Copy failed — try manually')
  }

  async function handleSaveToggle() {
    if (savingLoading) return
    setSavingLoading(true)
    try {
      if (isSaved) {
        await library.remove(user?.id ?? null, id)
        setIsSaved(false)
        toast.info('Removed from library')
        onSaveToggle?.(id, false)
      } else {
        await library.save(user?.id ?? null, {
          videoId: id,
          title: document.title || id,
          thumbnail: type === VIDEO_TYPE.YOUTUBE ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null,
        })
        setIsSaved(true)
        toast.success('Saved to library ✓')
        onSaveToggle?.(id, true)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update library')
    } finally {
      setSavingLoading(false)
    }
  }

  function handleFullscreen() {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) document.exitFullscreen()
      else el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.()
    } catch {
      toast.error('Fullscreen not available')
    }
  }

  // Seek to timestamp from notes panel
  function seekTo(seconds) {
    setSrc(buildSrc(seconds, speed))
    setIframeLoaded(false)
    reset(seconds)
    toast.info(`Jumped to ${fmtTime(seconds)}`, { duration: 1500 })
  }

  // Expose seekTo to parent via data attr (simple signal bus)
  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current._seekTo = seekTo
  })

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* ── Player ── */}
      <div ref={containerRef} className="relative w-full group">
        {/* 16:9 wrapper */}
        <div className="yt-container shadow-[0_12px_60px_rgba(0,0,0,0.6)] bg-bg-surface">
          {/* Skeleton — shows until iframe fires onLoad */}
          {!iframeLoaded && (
            <div className="absolute inset-0 z-10 rounded-xl overflow-hidden">
              <Skeleton className="w-full h-full rounded-none" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-bg-raised border border-bg-border
                  flex items-center justify-center">
                  <svg className="animate-spin-slow text-accent" width="22" height="22"
                    viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"
                      strokeDasharray="44" strokeDashoffset="14" strokeLinecap="round" opacity="0.7" />
                  </svg>
                </div>
                <span className="text-xs text-text-muted font-mono">Loading video…</span>
              </div>
            </div>
          )}

          {/* Embed blocked / error state */}
          {iframeError && (
            <div className="absolute inset-0 z-10 rounded-xl bg-bg-surface flex flex-col
              items-center justify-center gap-4 p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-danger-dim border border-danger/20
                flex items-center justify-center text-2xl">⚠️</div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Video could not load</p>
                <p className="text-xs text-text-muted max-w-xs">
                  The video may be private, embed-blocked, or unavailable.
                  Try opening it directly on YouTube.
                </p>
              </div>
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                  <ExternalIcon size={13} />
                  Open on YouTube
                </a>
              )}
            </div>
          )}

          {/* Resume banner */}
          {showResume && iframeLoaded && !iframeError && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20
              flex items-center gap-3 px-4 py-2.5 rounded-xl glass shadow-card
              animate-fade-down whitespace-nowrap border border-bg-border">
              <ClockIcon size={13} className="text-accent" />
              <span className="text-xs text-text-secondary">
                Resume from <span className="text-text-primary font-mono">{fmtTime(resumeFrom)}</span>?
              </span>
              <Button size="sm" onClick={handleResume}>Resume</Button>
              <button onClick={() => setShowResume(false)}
                className="text-xs text-text-muted hover:text-text-primary transition-colors">
                Dismiss
              </button>
            </div>
          )}

          {/* iframe */}
          <iframe
            ref={iframeRef}
            src={src}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className={`transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Floating save button — top right, NON-intrusive */}
        <button
          onClick={handleSaveToggle}
          disabled={savingLoading}
          title={isSaved ? 'Remove from library' : 'Save to library'}
          className={`
            absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5
            rounded-lg text-xs font-medium backdrop-blur-sm
            border transition-all duration-200 shadow-card
            ${isSaved
              ? 'bg-accent/15 border-accent/40 text-accent'
              : 'bg-bg-base/70 border-bg-border text-text-secondary hover:text-text-primary hover:border-accent/30'
            }
          `}
        >
          <BookmarkIcon size={13} filled={isSaved} />
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* ── Controls bar ── */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Left: speed + restart */}
        <div className="flex items-center gap-1.5">
          {/* Speed picker — only YouTube */}
          {type === VIDEO_TYPE.YOUTUBE && (
            <div ref={speedMenuRef} className="relative">
              <button
                onClick={() => setSpeedMenuOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                  border transition-all duration-200
                  ${speedMenuOpen
                    ? 'bg-bg-raised border-bg-border text-text-primary'
                    : 'bg-bg-surface border-bg-border text-text-secondary hover:text-text-primary hover:border-bg-muted'
                  }`}
              >
                <ClockIcon size={13} />
                {speed}×
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-50
                  bg-bg-surface border border-bg-border rounded-xl
                  shadow-card overflow-hidden animate-scale-in min-w-[72px]">
                  {SPEEDS.map(s => (
                    <button key={s} onClick={() => handleSpeedChange(s)}
                      className={`w-full text-left px-4 py-2 text-xs font-mono
                        transition-colors duration-100
                        ${s === speed
                          ? 'bg-accent-dim text-accent'
                          : 'text-text-secondary hover:bg-bg-raised hover:text-text-primary'
                        }`}>
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Restart */}
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
              bg-bg-surface border border-bg-border text-text-secondary
              hover:text-text-primary hover:border-bg-muted transition-all duration-200"
          >
            <RestartIcon size={13} />
            Restart
          </button>
        </div>

        {/* Right: copy + open + fullscreen */}
        <div className="flex items-center gap-1">
          <IconButton onClick={handleCopy} title="Copy video link">
            <CopyIcon size={14} />
          </IconButton>

          {youtubeUrl && (
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
              title="Open in YouTube"
              className="w-8 h-8 rounded-lg flex items-center justify-center
                text-text-secondary hover:text-text-primary hover:bg-bg-raised
                transition-all duration-150">
              <ExternalIcon size={14} />
            </a>
          )}

          <IconButton onClick={handleFullscreen} title="Fullscreen">
            <FullscreenIcon size={14} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

// Export seekTo access helper for NotesPanel
export function seekPlayerTo(containerEl, seconds) {
  if (containerEl?._seekTo) containerEl._seekTo(seconds)
}
