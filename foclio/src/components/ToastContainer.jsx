import React, { useEffect, useState } from 'react'
import { XIcon } from './ui'

const CONFIG = {
  success: {
    bar:  'bg-success',
    icon: '✓',
    iconCls: 'text-success',
    cls:  'border-success/20',
  },
  error: {
    bar:  'bg-danger',
    icon: '✕',
    iconCls: 'text-danger',
    cls:  'border-danger/20',
  },
  info: {
    bar:  'bg-accent',
    icon: '·',
    iconCls: 'text-accent text-lg',
    cls:  'border-bg-border',
  },
}

function Toast({ toast: t, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const cfg = CONFIG[t.type] || CONFIG.info

  useEffect(() => {
    // Trigger enter animation on mount
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      onClick={() => onDismiss(t.id)}
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer
        bg-bg-surface border shadow-card overflow-hidden
        transition-all duration-300 ease-spring select-none
        ${cfg.cls}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
      `}
    >
      {/* Accent bar on left */}
      <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${cfg.bar}`} />

      {/* Icon */}
      <span className={`text-xs font-mono mt-px flex-shrink-0 ${cfg.iconCls}`}>
        {cfg.icon}
      </span>

      {/* Message */}
      <span className="text-xs text-text-primary leading-relaxed flex-1 pr-1">
        {t.message}
      </span>

      {/* Close */}
      <button className="text-text-muted hover:text-text-secondary transition-colors mt-px">
        <XIcon size={12} />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, dismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2
      w-[320px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}
