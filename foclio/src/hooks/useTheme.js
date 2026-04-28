import { useEffect, useState } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('foclio_theme') !== 'light' } catch { return true }
  })

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', isDark)
    html.classList.toggle('light', !isDark)
    try { localStorage.setItem('foclio_theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  return { isDark, toggle: () => setIsDark(d => !d) }
}
