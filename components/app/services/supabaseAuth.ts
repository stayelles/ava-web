'use client'

import { createClient } from '@supabase/supabase-js'
import { fetchAuthResponse } from './authRequest'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants'

export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: fetchAuthResponse },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'ava-secure-auth',
  },
})
