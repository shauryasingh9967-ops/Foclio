// lib/db.js — All Supabase queries + localStorage fallbacks.
// Every function is safe to call even if Supabase is not configured.

import { supabase, supabaseReady } from './supabase'

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const auth = {
  async signInWithGoogle() {
    if (!supabaseReady) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  },

  async signInWithEmail(email) {
    if (!supabaseReady) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  },

  async signOut() {
    if (!supabaseReady) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    if (!supabaseReady) return null
    const { data, error } = await supabase.auth.getSession()
    if (error) return null
    return data.session
  },

  onAuthChange(cb) {
    if (!supabaseReady) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(cb)
  },
}

// ─── LIBRARY ─────────────────────────────────────────────────────────────────

export const library = {
  // localStorage key for guest mode
  _lsKey: 'foclio_library',

  _getLocal() {
    try { return JSON.parse(localStorage.getItem(this._lsKey) || '[]') } catch { return [] }
  },
  _setLocal(data) {
    try { localStorage.setItem(this._lsKey, JSON.stringify(data)) } catch {}
  },

  async getAll(userId) {
    if (!supabaseReady || !userId) {
      return this._getLocal()
    }
    const { data, error } = await supabase
      .from('saved_videos')
      .select(`
        id, video_id, title, thumbnail, channel_name, duration_sec, saved_at,
        watch_progress ( last_time, last_watched_at )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(v => ({
      ...v,
      lastTime: v.watch_progress?.[0]?.last_time ?? 0,
      lastWatchedAt: v.watch_progress?.[0]?.last_watched_at ?? null,
    }))
  },

  async save(userId, { videoId, title, thumbnail, channelName, durationSec }) {
    if (!supabaseReady || !userId) {
      const local = this._getLocal()
      const existing = local.findIndex(v => v.video_id === videoId)
      const entry = {
        id: `local_${videoId}`, video_id: videoId, title, thumbnail,
        channel_name: channelName, duration_sec: durationSec,
        saved_at: new Date().toISOString(), lastTime: 0,
      }
      if (existing >= 0) local[existing] = entry
      else local.unshift(entry)
      this._setLocal(local)
      return entry
    }
    const { data, error } = await supabase
      .from('saved_videos')
      .upsert({
        user_id: userId, video_id: videoId, title,
        thumbnail: thumbnail ?? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        channel_name: channelName ?? null, duration_sec: durationSec ?? null,
      }, { onConflict: 'user_id,video_id' })
      .select().single()
    if (error) throw error
    return data
  },

  async remove(userId, videoId) {
    if (!supabaseReady || !userId) {
      this._setLocal(this._getLocal().filter(v => v.video_id !== videoId))
      return
    }
    const { error } = await supabase
      .from('saved_videos').delete()
      .eq('user_id', userId).eq('video_id', videoId)
    if (error) throw error
  },

  async isSaved(userId, videoId) {
    if (!supabaseReady || !userId) {
      return this._getLocal().some(v => v.video_id === videoId)
    }
    const { data } = await supabase
      .from('saved_videos').select('id')
      .eq('user_id', userId).eq('video_id', videoId).maybeSingle()
    return !!data
  },
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────

export const progress = {
  _lsKey: (videoId) => `foclio_prog_${videoId}`,

  async get(userId, videoId) {
    if (!videoId) return 0
    if (!supabaseReady || !userId) {
      return parseFloat(localStorage.getItem(this._lsKey(videoId)) || '0') || 0
    }
    const { data } = await supabase
      .from('watch_progress').select('last_time')
      .eq('user_id', userId).eq('video_id', videoId).maybeSingle()
    return data?.last_time ?? 0
  },

  async save(userId, videoId, lastTime) {
    if (!videoId || lastTime < 3) return
    if (!supabaseReady || !userId) {
      try { localStorage.setItem(this._lsKey(videoId), String(lastTime)) } catch {}
      return
    }
    // Fire-and-forget; errors are non-critical
    supabase.from('watch_progress').upsert(
      { user_id: userId, video_id: videoId, last_time: Math.floor(lastTime), last_watched_at: new Date().toISOString() },
      { onConflict: 'user_id,video_id' }
    ).then(({ error }) => { if (error) console.warn('[progress]', error.message) })
  },

  async getRecent(userId, limit = 5) {
    if (!supabaseReady || !userId) return []
    const { data, error } = await supabase
      .from('watch_progress')
      .select(`video_id, last_time, last_watched_at, saved_videos(title,thumbnail,channel_name,duration_sec)`)
      .eq('user_id', userId)
      .not('saved_videos', 'is', null)
      .order('last_watched_at', { ascending: false })
      .limit(limit)
    if (error) return []
    return (data ?? []).map(p => ({
      videoId: p.video_id, lastTime: p.last_time,
      lastWatchedAt: p.last_watched_at,
      title: p.saved_videos?.title,
      thumbnail: p.saved_videos?.thumbnail,
      channelName: p.saved_videos?.channel_name,
      durationSec: p.saved_videos?.duration_sec,
      progressPct: p.saved_videos?.duration_sec
        ? Math.min(100, Math.round((p.last_time / p.saved_videos.duration_sec) * 100))
        : null,
    }))
  },
}

// ─── NOTES ───────────────────────────────────────────────────────────────────

export const notes = {
  _lsKey: (videoId) => `foclio_notes_${videoId}`,

  _getLocal(videoId) {
    try { return JSON.parse(localStorage.getItem(this._lsKey(videoId)) || '[]') } catch { return [] }
  },
  _setLocal(videoId, data) {
    try { localStorage.setItem(this._lsKey(videoId), JSON.stringify(data)) } catch {}
  },

  async getForVideo(userId, videoId) {
    if (!videoId) return []
    if (!supabaseReady || !userId) return this._getLocal(videoId)
    const { data, error } = await supabase
      .from('notes').select('*')
      .eq('user_id', userId).eq('video_id', videoId)
      .order('timestamp', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async create(userId, videoId, { timestamp, content, isImportant = false }) {
    if (!videoId) return null
    if (!supabaseReady || !userId) {
      const note = {
        id: `local_${Date.now()}`, user_id: null, video_id: videoId,
        timestamp: Math.floor(timestamp || 0), content: content.trim(),
        is_important: isImportant, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      const local = [...this._getLocal(videoId), note].sort((a, b) => a.timestamp - b.timestamp)
      this._setLocal(videoId, local)
      return note
    }
    const { data, error } = await supabase.from('notes')
      .insert({ user_id: userId, video_id: videoId, timestamp: Math.floor(timestamp || 0), content: content.trim(), is_important: isImportant })
      .select().single()
    if (error) throw error
    return data
  },

  async update(noteId, updates, { userId, videoId } = {}) {
    if (!supabaseReady || !userId) {
      // Local update
      if (!videoId) return null
      const local = this._getLocal(videoId).map(n =>
        n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
      )
      this._setLocal(videoId, local)
      return local.find(n => n.id === noteId)
    }
    const dbUpdates = {}
    if (updates.content    !== undefined) dbUpdates.content     = updates.content.trim()
    if (updates.is_important !== undefined) dbUpdates.is_important = updates.is_important
    const { data, error } = await supabase.from('notes').update(dbUpdates).eq('id', noteId).select().single()
    if (error) throw error
    return data
  },

  async delete(noteId, { userId, videoId } = {}) {
    if (!supabaseReady || !userId) {
      if (!videoId) return
      this._setLocal(videoId, this._getLocal(videoId).filter(n => n.id !== noteId))
      return
    }
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (error) throw error
  },
}
