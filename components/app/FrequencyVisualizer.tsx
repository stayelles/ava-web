'use client'

import { useEffect, useRef } from 'react'

interface Props {
  volumeLevel: number // 0-1
  isActive: boolean
}

const BARS = 12

export function FrequencyVisualizer({ volumeLevel, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barsRef = useRef<number[]>(Array(BARS).fill(10))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 200, H = 40
    canvas.width = W * 2
    canvas.height = H * 2
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(2, 2)

    const barWidth = W / BARS - 4

    // Animate bars toward target
    const target = isActive
      ? Array.from({ length: BARS }, (_, i) => {
          const center = BARS / 2
          const dist = Math.abs(i - center) / center
          const base = volumeLevel * 255 * (1 - dist * 0.5)
          return Math.max(10, base + (Math.random() - 0.5) * 40 * volumeLevel)
        })
      : Array(BARS).fill(10)

    barsRef.current = barsRef.current.map((v, i) => v + (target[i] - v) * 0.25)

    ctx.clearRect(0, 0, W, H)
    for (let i = 0; i < BARS; i++) {
      const pct = barsRef.current[i] / 255
      const barH = Math.max(4, pct * H)
      const x = i * (barWidth + 4) + 2
      const y = (H - barH) / 2
      ctx.fillStyle = '#be123c'
      ctx.globalAlpha = isActive ? 0.85 : 0.2
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barH, 3)
      ctx.fill()
    }
  })

  return (
    <canvas ref={canvasRef} className="transition-opacity duration-300" />
  )
}
