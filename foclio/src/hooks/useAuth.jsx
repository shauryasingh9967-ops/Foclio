// hooks/useAuth.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth } from '../lib/db'
import { supabaseReady } from '../lib/supabase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  // undefined = loading | null = guest | object = signed-in user
  const [user, setUser] = useState(supabaseReady ? undefined : null)

  useEffect(() => {
    if (!supabaseReady) return // skip entirely if no Supabase

    let mounted = true

    // Get initial session once
    auth.getSession()
      .then(s => { if (mounted) setUser(s?.user ?? null) })
      .catch(() => { if (mounted) setUser(null) })

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = auth.onAuthChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // ← empty deps — runs once only, no infinite loop

  const signInWithGoogle = useCallback(async () => {
    await auth.signInWithGoogle()
  }, [])

  const signInWithEmail = useCallback(async (email) => {
    await auth.signInWithEmail(email)
  }, [])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
  }, [])

  return (
    <Ctx.Provider value={{
      user,
      loading:       user === undefined,
      isGuest:       user === null,
      supabaseReady,
      signInWithGoogle,
      signInWithEmail,
      signOut,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>')
  return ctx
}
