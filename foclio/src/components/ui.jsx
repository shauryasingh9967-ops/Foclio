// components/ui.jsx — Reusable primitive components

import React from 'react'

/* ── Spinner ──────────────────────────────────────────────────────────────── */
export function Spinner({ size = 16, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 16 16" fill="none"
      className={`animate-spin-slow ${className}`}
    >
      <circle cx="8" cy="8" r="6"
        stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="28" strokeDashoffset="10"
        strokeLinecap="round" opacity="0.8"
      />
    </svg>
  )
}

/* ── Skeleton block ───────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

/* ── Icon Button ─────────────────────────────────────────────────────────── */
export function IconButton({
  children, onClick, title, className = '',
  variant = 'ghost', size = 'md', disabled = false,
}) {
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-9 h-9' }
  const variants = {
    ghost:   'text-text-secondary hover:text-text-primary hover:bg-bg-raised transition-all duration-150',
    accent:  'text-accent hover:bg-accent-dim transition-all duration-150',
    danger:  'text-text-secondary hover:text-danger hover:bg-danger-dim transition-all duration-150',
  }
  return (
    <button
      onClick={onClick} title={title} disabled={disabled}
      className={`
        ${sizes[size]} rounded-lg flex items-center justify-center flex-shrink-0
        focus-accent disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}

/* ── Button ──────────────────────────────────────────────────────────────── */
export function Button({
  children, onClick, disabled = false, loading = false,
  variant = 'primary', size = 'md', className = '', type = 'button',
}) {
  const sizes = {
    sm:   'px-3 py-1.5 text-xs gap-1.5',
    md:   'px-4 py-2   text-sm gap-2',
    lg:   'px-5 py-2.5 text-sm gap-2',
  }
  const variants = {
    primary:  'bg-accent hover:bg-accent-hover text-bg-base font-semibold shadow-glow-sm hover:shadow-glow',
    ghost:    'bg-transparent hover:bg-bg-raised text-text-secondary hover:text-text-primary border border-bg-border',
    danger:   'bg-danger-dim hover:bg-danger/20 text-danger border border-danger/30',
    outline:  'bg-transparent border border-bg-border hover:border-accent/40 text-text-secondary hover:text-text-primary',
  }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all duration-200 ease-spring focus-accent
        disabled:opacity-50 disabled:cursor-not-allowed select-none
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {loading && <Spinner size={13} className="mr-1" />}
      {children}
    </button>
  )
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-bg-raised text-text-secondary border-bg-border',
    accent:  'bg-accent-dim text-accent border-accent-border',
    success: 'bg-success-dim text-success border-success/30',
    danger:  'bg-danger-dim text-danger border-danger/30',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono
      border ${variants[variant]}`}>
      {children}
    </span>
  )
}

/* ── Divider ─────────────────────────────────────────────────────────────── */
export function Divider({ className = '' }) {
  return <div className={`h-px bg-bg-border ${className}`} />
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 gap-3 animate-fade-up">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-bg-raised border border-bg-border
          flex items-center justify-center text-text-muted mb-1">
          {icon}
        </div>
      )}
      {title && <p className="text-sm font-medium text-text-secondary">{title}</p>}
      {description && <p className="text-xs text-text-muted leading-relaxed max-w-[200px]">{description}</p>}
      {action}
    </div>
  )
}

/* ── Error state ─────────────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 gap-3 animate-fade-up">
      <div className="w-10 h-10 rounded-xl bg-danger-dim border border-danger/20
        flex items-center justify-center">
        <WarningIcon className="text-danger" />
      </div>
      <div>
        <p className="text-sm text-text-secondary font-medium mb-1">Something went wrong</p>
        <p className="text-xs text-text-muted">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="text-xs text-accent hover:underline focus-accent rounded">
          Try again
        </button>
      )}
    </div>
  )
}

/* ── Icons (inline SVG, tree-shakeable) ──────────────────────────────────── */
const icon = (path, vb = '0 0 16 16') => ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox={vb} fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {typeof path === 'string' ? <path d={path} /> : path}
  </svg>
)

export const PlusIcon       = icon('M8 3v10M3 8h10')
export const XIcon          = icon('M3 3l10 10M13 3L3 13')
export const SearchIcon     = icon(<><circle cx="7" cy="7" r="4.5"/><path d="M11 11l3 3"/></>)
export const BookmarkIcon   = ({ filled, ...p }) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={p.className}>
    <path d="M4 2h8a1 1 0 0 1 1 1v10l-5-2.5L3 13V3a1 1 0 0 1 1-1z"/>
  </svg>
)
export const StarIcon       = ({ filled, ...p }) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 16 16" fill={filled?'currentColor':'none'}
    stroke="currentColor" strokeWidth="1.5" className={p.className}>
    <path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.2 4.3 13.3l.7-4.1-3-2.9 4.2-.7z"/>
  </svg>
)
export const ClockIcon      = icon(<><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></>)
export const CopyIcon       = icon(<><rect x="5" y="5" width="7" height="7" rx="1.5"/><path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-4A1.5 1.5 0 0 0 2 3.5v4A1.5 1.5 0 0 0 3.5 7H5"/></>)
export const ExternalIcon   = icon('M6 3H3v10h10v-3M9 3h4m0 0v4m0-4L7 10')
export const FullscreenIcon = icon('M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3')
export const RestartIcon    = icon('M2.5 7.5A5.5 5.5 0 1 0 3.2 5M2.5 2.5v3h3')
export const TrashIcon      = icon('M3 4.5h10M6 4.5V3h4v1.5M5 4.5v7a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7')
export const EditIcon       = icon('M2.5 12.5l1.5-1.5 6-6a1.4 1.4 0 0 1 2 2l-6 6-1.5 1.5-2.5.5.5-2.5z')
export const SunIcon        = icon(<><circle cx="8" cy="8" r="3"/><path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.7 3.7l.7.7M11.6 11.6l.7.7M3.7 12.3l.7-.7M11.6 4.4l.7-.7"/></>)
export const MoonIcon       = icon('M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z')
export const ChevronDown    = icon('M4 6l4 4 4-4')
export const ChevronRight   = icon('M6 4l4 4-4 4')
export const WarningIcon    = icon(<><path d="M8 3L14 13H2L8 3z"/><path d="M8 7v3M8 11.5v.5"/></>)
export const MenuIcon       = icon('M3 5h10M3 8h10M3 11h10')
export const PlayIcon       = ({ ...p }) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 16 16" fill="currentColor" className={p.className}>
    <polygon points="4,2 14,8 4,14"/>
  </svg>
)
export const LibraryIcon    = icon(<><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 3v10M9 6h3M9 9h3"/></>)
export const NotesIcon      = icon(<><rect x="3" y="2" width="10" height="12" rx="1.5"/><path d="M6 5.5h4M6 8h4M6 10.5h2.5"/></>)
export const UserIcon       = icon(<><circle cx="8" cy="6" r="2.5"/><path d="M2.5 13a5.5 5.5 0 0 1 11 0"/></>)
export const LogOutIcon     = icon('M10.5 5.5L13 8l-2.5 2.5M13 8H6M6 3H3v10h3')
