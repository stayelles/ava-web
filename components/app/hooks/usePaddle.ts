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

    function initPaddle() {
      const p = window.Paddle as any
      if (!p) return
      if (PADDLE_CLIENT_TOKEN.startsWith('test_')) {
        p.Environment.set('sandbox')
      }
      p.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event: PaddleEvent) => {
          if (event.name === 'checkout.completed') {
            onSuccessRef.current?.()
            onCheckoutComplete?.()
          }
        },
      })
      readyRef.current = true
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
    onSuccessRef.current = onSuccess
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(email ? { customData: { email }, customer: { email } } : {}),
      settings: { theme: 'dark' },
    })
  }, [])

  return { openCheckout, ready: readyRef.current }
}
