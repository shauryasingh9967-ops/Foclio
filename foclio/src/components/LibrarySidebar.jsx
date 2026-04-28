import React, { useCallback } from 'react'
import { useLibrary } from '../hooks/useLibrary'
import { useAuth }    from '../hooks/useAuth'
import { fmtTime }    from '../utils/video'
import { Skeleton, EmptyState, ErrorState, LibraryIcon, PlayIcon } from './ui'

export default function LibrarySidebar({ activeVideoId, onSelect, refreshSignal }) {
  const { user, isGuest } = useAuth()
  const { items, loading, error, remove, reload } = useLibrary()

  // Reload when a video is saved from the player
  React.useEffect(() => { if (refreshSignal) reload() }, [refreshSignal])

  if (isGuest && !items.length) {
    return (
      <div className="h-full flex flex-col">
        <SidebarHeader count={0} onRefresh={reload} />
        <EmptyState
          icon={<LibraryIcon size={18} />}
          title="Your library is empty"
          description="Sign in to save videos and sync across devices, or start watching to build a local library."
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <SidebarHeader count={items.length} onRefresh={reload} />

      <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-1">
        {loading && !items.length ? (
          <LibSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<LibraryIcon size={18} />}
            title="No saved videos"
            description="Hit Save while watching to add videos here."
          />
        ) : (
          items.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              isActive={v.video_id === activeVideoId}
              onSelect={() => onSelect(v.video_id)}
              onRemove={() => remove(v.video_id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function SidebarHeader({ count, onRefresh }) {
  return (
    <div className="flex items-center justify-between px-3 py-3 border-b border-bg-border flex-shrink-0">
      <div className="flex items-center gap-2">
        <LibraryIcon size={14} className="text-text-muted" />
        <span className="text-sm font-medium text-text-primary">Library</span>
        {count > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md
            bg-bg-raised text-text-muted border border-bg-border">
            {count}
          </span>
        )}
      </div>
      <button onClick={onRefresh}
        className="w-6 h-6 rounded-md flex items-center justify-center
          text-text-muted hover:text-text-primary hover:bg-bg-raised transition-all"
        title="Refresh">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 6a4 4 0 1 0 .4-1.8M2 2v3h3" />
        </svg>
      </button>
    </div>
  )
}

function VideoCard({ video, isActive, onSelect, onRemove }) {
  const [hovered, setHovered] = React.useState(false)
  const pct = video.duration_sec && video.lastTime
    ? Math.min(100, Math.round((video.lastTime / video.duration_sec) * 100))
    : null

  return (
    <div
      className={`group relative flex gap-2.5 p-2 rounded-xl cursor-pointer
        transition-all duration-200
        ${isActive
          ? 'bg-accent-dim border border-accent-border'
          : 'border border-transparent hover:bg-bg-raised hover:border-bg-border'
        }`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-[68px] h-[40px] rounded-lg overflow-hidden
        bg-bg-raised relative">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt="" loading="lazy"
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayIcon size={14} className="text-text-muted" />
          </div>
        )}
        {/* Active indicator */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <PlayIcon size={7} className="text-bg-base" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium leading-tight line-clamp-2 mb-1
          ${isActive ? 'text-accent' : 'text-text-primary'}`}>
          {video.title || 'Untitled Video'}
        </p>
        {video.channel_name && (
          <p className="text-[10px] text-text-muted truncate">{video.channel_name}</p>
        )}
        {video.lastTime > 0 && (
          <p className="text-[10px] font-mono text-text-muted mt-0.5">
            {fmtTime(video.lastTime)}{pct !== null ? ` · ${pct}%` : ''}
          </p>
        )}
        {/* Progress bar */}
        {pct > 0 && (
          <div className="mt-1.5 h-[2px] w-full bg-bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent/50 rounded-full transition-all"
              style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* Remove button */}
      {hovered && onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          className="absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center
            bg-bg-overlay border border-bg-border text-text-muted
            hover:text-danger hover:border-danger/30 transition-all duration-150"
          title="Remove"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 1l6 6M7 1L1 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

function LibSkeleton() {
  return (
    <div className="space-y-1.5 pt-1">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex gap-2.5 p-2">
          <Skeleton className="w-[68px] h-[40px] flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
