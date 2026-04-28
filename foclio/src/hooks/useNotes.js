// hooks/useNotes.js
// Manages notes for the current video. Works with or without Supabase.

import { useState, useEffect, useCallback, useRef } from 'react'
import { notes as notesDB } from '../lib/db'
import { useAuth } from './useAuth'

export function useNotes({ videoId }) {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Load notes whenever videoId or auth state changes
  useEffect(() => {
    if (!videoId) { setItems([]); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    notesDB.getForVideo(user?.id ?? null, videoId)
      .then(data => { if (!cancelled) setItems(data) })
      .catch(err => { if (!cancelled) setError(err.message || 'Could not load notes') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [videoId, user?.id])

  const addNote = useCallback(async ({ timestamp, content, isImportant = false }) => {
    if (!videoId || !content?.trim()) return null
    try {
      const note = await notesDB.create(user?.id ?? null, videoId, { timestamp, content, isImportant })
      setItems(prev => [...prev, note].sort((a, b) => a.timestamp - b.timestamp))
      return note
    } catch (err) {
      throw new Error(err.message || 'Failed to save note')
    }
  }, [videoId, user?.id])

  const updateNote = useCallback(async (noteId, updates) => {
    try {
      const updated = await notesDB.update(noteId, updates, { userId: user?.id ?? null, videoId })
      setItems(prev => prev.map(n => n.id === noteId ? (updated ?? { ...n, ...updates }) : n))
    } catch (err) {
      throw new Error(err.message || 'Failed to update note')
    }
  }, [videoId, user?.id])

  const deleteNote = useCallback(async (noteId) => {
    try {
      await notesDB.delete(noteId, { userId: user?.id ?? null, videoId })
      setItems(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      throw new Error(err.message || 'Failed to delete note')
    }
  }, [videoId, user?.id])

  return { items, loading, error, addNote, updateNote, deleteNote }
}
