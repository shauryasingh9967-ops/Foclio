import React from 'react'

const FEATURES = [
  { icon: '⏱', label: 'Timestamped notes' },
  { icon: '📚', label: 'Personal library' },
  { icon: '▶', label: 'Resume anywhere' },
  { icon: '⚡', label: 'Speed controls' },
  { icon: '★',  label: 'Star important moments' },
  { icon: '🔍', label: 'Search your notes' },
]

export default function EmptyLanding() {
  return (
    <div className="flex flex-col items-center py-12 animate-fade-up">
      {/* Decorative stacked player illustration */}
      <div className="relative w-56 h-[136px] mb-10">
        {/* Back cards */}
        <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl
          bg-bg-raised border border-bg-border opacity-50" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl
          bg-bg-surface border border-bg-border opacity-70" />

        {/* Main card */}
        <div className="absolute inset-0 rounded-2xl bg-bg-surface
          border border-bg-border shadow-card overflow-hidden
          flex items-center justify-center">

          {/* Scan-line texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)',
            }}
          />

          {/* Corner dots */}
          {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-bg-border`} />
          ))}

          {/* Play button */}
          <div className="relative z-10">
            <div className="absolute inset-0 -m-4 rounded-full bg-accent/10 animate-pulse-soft" />
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center
              shadow-glow relative z-10">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="#08090a">
                <polygon points="2.5,1.5 11,6 2.5,10.5" />
              </svg>
            </div>
          </div>

          {/* Fake progress bar */}
          <div className="absolute bottom-3 left-4 right-4 h-[3px] bg-bg-border rounded-full overflow-hidden">
            <div className="h-full w-2/5 bg-accent/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
              bg-bg-surface border border-bg-border text-text-muted
              animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="text-[11px]">{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>
    </div>
  )
}
