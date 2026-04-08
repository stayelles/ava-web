'use client'

import { useState, useEffect } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants'

/**
 * Fetches the shared Gemini API key from the Supabase Edge Function.
 * The key is never baked into the bundle — it's fetched at runtime for authenticated users.
 * To rotate the key: update the GEMINI_API_KEY secret in Supabase → all clients pick it up
 * on next session start, no app update required.
 */
export function useConfig(userId: string | null | undefined) {
  const [geminiApiKey, setGeminiApiKey] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    fetch(`${SUPABASE_URL}/functions/v1/get-config`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-id': userId,
      },
    })
      .then(r => r.json())
      .then(data => { if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey) })
      .catch(() => { /* fallback to env var if Edge Function unreachable */ })
  }, [userId])

  return geminiApiKey
}
