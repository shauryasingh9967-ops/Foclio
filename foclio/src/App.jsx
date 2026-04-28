// App.jsx — Root. AuthProvider + theme + toast + global keyboard shortcuts.

import React, { useState, useEffect } from 'react'
import { AuthProvider } from './hooks/useAuth'
import { useTheme }     from './hooks/useTheme'
import { useToast }     from './hooks/useToast'
import Navbar           from './components/Navbar'
import ViewerPage       from './pages/ViewerPage'
import ToastContainer   from './components/ToastContainer'
import AuthModal        from './components/AuthModal'

function AppInner() {
  const { isDark, toggle } = useTheme()
  const { toasts, toast, dismiss } = useToast()
  const [showAuth, setShowAuth] = useState(false)

  // Global keyboard shortcut: F = fullscreen on any iframe
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'f' || e.key === 'F') {
        const iframe = document.querySelector('.yt-container iframe')
        if (!iframe) return
        try {
          document.fullscreenElement
            ? document.exitFullscreen()
            : iframe.requestFullscreen?.()
        } catch {}
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    /* Full-height flex column — fixes overflow issues */
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base">
      <Navbar
        isDark={isDark}
        onToggleTheme={toggle}
        onAuthClick={() => setShowAuth(true)}
      />

      {/* Main area fills remaining height and scrolls internally */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ViewerPage toast={toast} />
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
