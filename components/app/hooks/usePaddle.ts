'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PADDLE_CLIENT_TOKEN } from '../constants'

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string; eventCallback?: (e: PaddleEvent) => void }) => void
      Checkout: {
        open: (opts: PaddleCheckoutOptions) => void
      }
    }
  }
}

interface PaddleEvent {
  name: string
  data?: Record<string, unknown>
}

interface PaddleCheckoutOptions {
  items: Array<{ priceId: string; quantity: number }>
  customData?: Record<string, string>
  customer?: { email?: string }
  settings?: { theme?: 'light' | 'dark'; locale?: string; successUrl?: string }
}

interface UsePaddleReturn {
  openCheckout: (priceId: string, email?: string, onSuccess?: () => void) => void
  ready: boolean
}

export function usePaddle(onCheckoutComplete?: () => void): UsePaddleReturn {
  const readyRef = useRef(false)
  const onSuccessRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (PADDLE_CLIENT_TOKEN.startsWith('TODO')) return

    // Intercept fetch to log Paddle 400 responses
    const origFetch = window.fetch
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await origFetch(...args)
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
      if (!res.ok && url.includes('paddle.com')) {
        res.clone().json().then((body: unknown) => {
          console.error('[Paddle 400 body]', JSON.stringify(body, null, 2))
        }).catch(() => res.clone().text().then((t: string) => console.error('[Paddle 400 text]', t)))
      }
      return res
    }

    function initPaddle() {
      const p = window.Paddle as any
      if (!p) return
      // Sandbox mode must be set BEFORE Initialize
      if (PADDLE_CLIENT_TOKEN.startsWith('test_')) {
        p.Environment.set('sandbox')
      }
      p.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event: PaddleEvent) => {
          console.log('[Paddle event]', event.name, event.data)
          if (event.name === 'checkout.completed') {
            onSuccessRef.current?.()
            onCheckoutComplete?.()
          }
        },
      })
      readyRef.current = true
      console.log('[Paddle] Initialized with token:', PADDLE_CLIENT_TOKEN.slice(0, 10) + '...')
    }

    // Already loaded (e.g. hot-reload) — re-initialize
    if (window.Paddle) {
      initPaddle()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.onload = initPaddle
    document.head.appendChild(script)
  }, [onCheckoutComplete])

  const openCheckout = useCallback((priceId: string, email?: string, onSuccess?: () => void) => {
    if (!window.Paddle) {
      console.warn('[usePaddle] Paddle not loaded yet')
      return
    }
    console.log('[Paddle] openCheckout priceId:', priceId)
    onSuccessRef.current = onSuccess
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(email ? { customData: { email }, customer: { email } } : {}),
      settings: { theme: 'dark' },
    })
  }, [])

  return { openCheckout, ready: readyRef.current }
}
