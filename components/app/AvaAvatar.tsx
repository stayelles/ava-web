'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  isActive: boolean
  volume: number // 0-1
}

export function AvaAvatar({ isActive, volume }: Props) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [imgScale, setImgScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [verticalOffset, setVerticalOffset] = useState(0)
  const rafRef = useRef<number>(0)

  // Mouse tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2),
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Volume-driven animation
  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    if (!isActive) {
      setImgScale(1); setRotation(0); setVerticalOffset(0)
      return
    }
    const animate = () => {
      if (volume > 0.01) {
        const intensity = Math.min(volume * 5, 1)
        setRotation(Math.sin(Date.now() / 400) * 3 * intensity)
        setVerticalOffset(Math.abs(Math.sin(Date.now() / 300)) * -4 * intensity)
        setImgScale(1.05 + volume * 0.2)
      } else {
        setRotation(0); setVerticalOffset(0); setImgScale(1)
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, volume])

  const lookIntensity = isActive ? 10 : 5
  const rotateY = mousePos.x * lookIntensity
  const rotateX = -mousePos.y * lookIntensity

  return (
    <div className="relative flex items-center justify-center w-full h-full" style={{ perspective: 1000 }}>
      {/* Pulsing aura when active */}
      {isActive && (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all duration-100"
            style={{
              width: `${120 + volume * 100}%`,
              height: `${120 + volume * 100}%`,
              background: 'rgba(225,29,72,0.2)',
              opacity: Math.max(0.3, volume * 2),
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-100"
            style={{
              width: `${100 + volume * 50}%`,
              height: `${100 + volume * 50}%`,
              border: '1px solid rgba(225,29,72,0.35)',
              opacity: 0.4 + volume,
            }}
          />
        </>
      )}

      {/* Head container with 3D perspective */}
      <div
        className={`relative z-10 w-[85%] h-[85%] rounded-full ${isActive && volume < 0.01 ? 'animate-[float_3s_ease-in-out_infinite]' : ''} transition-transform duration-300`}
        style={{ transform: `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)` }}
      >
        {/* Avatar image */}
        <div
          className={`w-full h-full rounded-full overflow-hidden border-4 shadow-2xl relative transition-all duration-300 ${
            isActive ? 'border-rose-400 shadow-rose-500/40' : 'border-slate-600'
          }`}
          style={{ filter: isActive ? 'none' : 'grayscale(0.6) brightness(0.8)' }}
        >
          <Image
            src="/logo.png"
            alt="Ava"
            fill
            className="object-cover object-top"
            style={{
              transform: isActive
                ? `scale(${imgScale}) rotateZ(${rotation}deg) translateY(${verticalOffset}px)`
                : 'scale(1)',
              filter: isActive ? `brightness(${1 + volume * 0.3})` : 'none',
              transition: isActive ? 'none' : 'transform 0.3s, filter 0.3s',
            }}
          />

          {/* Inactive overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ background: 'rgba(2,6,23,0.4)', opacity: isActive ? 0 : 1 }}
          />
        </div>

        {/* Status jewel */}
        <div
          className={`absolute bottom-[5%] right-[14%] w-[15%] h-[15%] min-w-[12px] min-h-[12px] rounded-full border-2 border-slate-900 z-20 transition-all duration-300 flex items-center justify-center ${
            isActive ? 'bg-green-400 shadow-[0_0_15px_#4ade80]' : 'bg-slate-600'
          }`}
        >
          {isActive && <div className="w-full h-full rounded-full bg-white/50 animate-ping" />}
        </div>
      </div>
    </div>
  )
}
