import { useState, useEffect, useCallback } from 'react'
import { library, progress as progressDB } from '../lib/db'
import { useAuth } from './useAuth'

export function useLibrary() {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await library.getAll(user?.id ?? null)
      setItems(data)
    } catch (err) {
      setError(err.message || 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (videoInfo) => {
    const saved = await library.save(user?.id ?? null, videoInfo)
    setItems(prev => {
      const exists = prev.find(v => v.video_id === videoInfo.videoId)
      if (exists) return prev
      return [saved, ...prev]
    })
    return saved
  }, [user?.id])

  const remove = useCallback(async (videoId) => {
    await library.remove(user?.id ?? null, videoId)
    setItems(prev => prev.filter(v => v.video_id !== videoId))
  }, [user?.id])

  const isSaved = useCallback((videoId) => {
    return items.some(v => v.video_id === videoId)
  }, [items])

  return { items, loading, error, save, remove, isSaved, reload: load }
}
