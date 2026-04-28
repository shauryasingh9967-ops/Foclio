import { useCallback, useRef, useState } from 'react'

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const toast = useCallback(({ message, type = 'info', duration = 3000 }) => {
    const id = ++_id
    setToasts(p => [...p.slice(-3), { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  // Convenience wrappers
  toast.success = (msg, opts) => toast({ message: msg, type: 'success', ...opts })
  toast.error   = (msg, opts) => toast({ message: msg, type: 'error',   ...opts })
  toast.info    = (msg, opts) => toast({ message: msg, type: 'info',    ...opts })

  return { toasts, toast, dismiss }
}
