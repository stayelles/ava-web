'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; size: number; speedY: number
  baseOpacity: number; wobble: number; wobbleSpeed: number
}

interface Props {
  isActive: boolean
  volume: number // 0-1
}

export function BackgroundParticles({ isActive, volume }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const init = (w: number, h: number) => {
      const count = w < 768 ? 40 : 80
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.1,
        baseOpacity: Math.random() * 0.3 + 0.1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01,
      }))
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      init(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const render = () => {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const speedMul = isActive ? 1 + volume * 4 : 1
      const opacityBoost = isActive ? volume * 0.6 : 0

      particlesRef.current.forEach(p => {
        p.y -= p.speedY * speedMul
        p.wobble += p.wobbleSpeed
        p.x += Math.sin(p.wobble) * 0.2
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(225,29,72,${Math.min(p.baseOpacity + opacityBoost, 0.8)})`
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, volume])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
