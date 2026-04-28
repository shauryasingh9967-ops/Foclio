import { useState, useEffect } from 'react'

export function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key)
      return s !== null ? JSON.parse(s) : defaultVal
    } catch { return defaultVal }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
  }, [key, val])

  return [val, setVal]
}
