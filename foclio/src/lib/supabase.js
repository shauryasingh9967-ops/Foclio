// lib/supabase.js
// Safe init — if env vars missing, supabase = null and app uses localStorage.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL  || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase      = (url && key) ? createClient(url, key) : null
export const supabaseReady = !!(url && key)
