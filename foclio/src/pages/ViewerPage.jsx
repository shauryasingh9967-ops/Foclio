// pages/ViewerPage.jsx
// Main application page. Manages video state + wires sidebar, player, notes.
// Fixes: overflow issues, no blank screens, proper scroll, layout correctness.

import React, { useState, useCallback, useRef } from 'react'
import VideoPlayer                    from '../components/VideoPlayer'
import NotesPanel                     from '../components/NotesPanel'
import LibrarySidebar                 from '../components/LibrarySidebar'
import UrlInput                       from '../components/UrlInput'
import EmptyLanding                   from '../components/EmptyLanding'
import { VIDEO_TYPE }                 from '../utils/video'
import { MenuIcon, ChevronRight }     from '../components/ui'

export default function ViewerPage({ toast }) {
  const [video, setVideo]             = useState(null)   // { type, id, embedUrl, ... }
  const [libRefresh, setLibRefresh]   = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notesOpen, setNotesOpen]     = useState(true)

  const playerContainerRef = useRef(null)

  // Load a video from URL or library click
  const loadVideo = useCallback((data) => {
    setVideo(data)
    setCurrentTime(0)
    // On mobile: collapse sidebar when video loads
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [])

  // Library card clicked — build minimal video data from videoId
  const loadFromLibrary = useCallback((videoId) => {
    setVideo({
      type:         VIDEO_TYPE.YOUTUBE,
      id:           videoId,
      embedUrl:     null,
      youtubeUrl:   `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      rawUrl:       `https://www.youtube.com/watch?v=${videoId}`,
      error:        null,
    })
    setCurrentTime(0)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [])

  // After save/unsave — refresh sidebar list
  const handleSaveToggle = useCallback(() => {
    setLibRefresh(n => n + 1)
  }, [])

  // Notes panel tells us to seek — player listens via ref
  const handleSeekTo = useCallback((seconds) => {
    if (playerContainerRef.current?._seekTo) {
      playerContainerRef.current._seekTo(seconds)
    }
  }, [])

  /* ─── LANDING (no video loaded yet) ─── */
  if (!video) {
    return (
      <div className="flex h-full overflow-hidden">
        {/* Sidebar — always visible on desktop */}
        <Sidebar
          isOpen={sidebarOpen}
          activeId={null}
          onSelect={loadFromLibrary}
          refreshSignal={libRefresh}
          onToggle={() => setSidebarOpen(v => !v)}
        />

        {/* Main landing area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="flex flex-col items-center justify-center
            min-h-full px-4 py-12">
            <UrlInput onLoad={loadVideo} />
            <EmptyLanding />
          </div>
        </main>
      </div>
    )
  }

  /* ─── PLAYER LAYOUT ─── */
  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={sidebarOpen}
        activeId={video.id}
        onSelect={loadFromLibrary}
        refreshSignal={libRefresh}
        onToggle={() => setSidebarOpen(v => !v)}
      />

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-5 max-w-[1400px] mx-auto">

          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                  text-text-muted hover:text-text-primary hover:bg-bg-raised transition-all"
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <MenuIcon size={14} />
              </button>

              {/* Platform badge */}
              <PlatformBadge type={video.type} />

              {/* URL truncated */}
              <span className="text-[11px] font-mono text-text-muted truncate
                max-w-[180px] sm:max-w-[320px] hidden xs:block">
                {video.rawUrl}
              </span>
            </div>

            {/* Change video */}
            <button
              onClick={() => { setVideo(null); setCurrentTime(0) }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-xs text-text-secondary border border-bg-border
                hover:text-text-primary hover:border-bg-muted
                bg-bg-surface transition-all duration-200"
            >
              <ChevronRight size={12} />
              Change
            </button>
          </div>

          {/* Player + Notes */}
          <div className="flex flex-col xl:flex-row gap-4">

            {/* Player — takes maximum space */}
            <div className="flex-1 min-w-0">
              <div ref={playerContainerRef}>
                <VideoPlayer
                  videoData={video}
                  onSaveToggle={handleSaveToggle}
                  toast={toast}
                />
              </div>

              {/* Notes toggle on mobile/tablet */}
              <button
                onClick={() => setNotesOpen(v => !v)}
                className="xl:hidden mt-3 w-full py-2.5 rounded-xl text-xs
                  bg-bg-surface border border-bg-border text-text-secondary
                  hover:text-text-primary transition-colors"
              >
                {notesOpen ? 'Hide Notes ↑' : 'Show Notes ↓'}
              </button>
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <div className="xl:w-[320px] xl:flex-shrink-0
                xl:max-h-[calc(100vh-130px)] xl:sticky xl:top-4">
                <div className="bg-bg-surface border border-bg-border rounded-2xl
                  shadow-card overflow-hidden flex flex-col
                  min-h-[300px] xl:h-[calc(100vh-130px)]">
                  <NotesPanel
                    videoId={video.id}
                    getCurrentTime={() => currentTime}
                    currentTime={currentTime}
                    onSeekTo={handleSeekTo}
                    toast={toast}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Sidebar wrapper ── */
function Sidebar({ isOpen, activeId, onSelect, refreshSignal, onToggle }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 overflow-hidden
          border-r border-bg-border bg-bg-base
          transition-all duration-300 ease-spring
          ${isOpen ? 'w-[240px]' : 'w-0'}`}
      >
        {isOpen && (
          <LibrarySidebar
            activeVideoId={activeId}
            onSelect={onSelect}
            refreshSignal={refreshSignal}
          />
        )}
      </aside>

      {/* Mobile sidebar — slide-over drawer */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onToggle}
          />
          <aside className="lg:hidden fixed left-0 top-12 bottom-0 z-30 w-[260px]
            bg-bg-base border-r border-bg-border shadow-modal
            flex flex-col animate-slide-right overflow-hidden">
            <LibrarySidebar
              activeVideoId={activeId}
              onSelect={(id) => { onSelect(id); onToggle() }}
              refreshSignal={refreshSignal}
            />
          </aside>
        </>
      )}
    </>
  )
}

/* ── Platform badge ── */
function PlatformBadge({ type }) {
  if (type === VIDEO_TYPE.YOUTUBE) {
    return (
      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5
        rounded-md text-[11px] bg-red-500/10 border border-red-500/20 text-red-400">
        <svg width="11" height="8" viewBox="0 0 14 10" fill="currentColor">
          <path d="M13.6 1.56A1.76 1.76 0 0 0 12.36.3C11.28 0 7 0 7 0S2.72 0 1.64.3A1.76 1.76 0 0 0 .4 1.56C0 2.6 0 4.8 0 4.8s0 2.2.4 3.24A1.76 1.76 0 0 0 1.64 9.3C2.72 9.6 7 9.6 7 9.6s4.28 0 5.36-.3a1.76 1.76 0 0 0 1.24-1.26C14 7 14 4.8 14 4.8s0-2.2-.4-3.24zM5.6 6.8V2.8l3.6 2-3.6 2z" />
        </svg>
        YouTube
      </span>
    )
  }
  return (
    <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5
      rounded-md text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-400">
      Google Drive
    </span>
  )
}
