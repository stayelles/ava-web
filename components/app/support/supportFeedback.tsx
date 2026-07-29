'use client'

export function playSupportMessageSound() {
  try {
    const AudioContextClass = window.AudioContext
      || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.32)
    gain.connect(context.destination)
    for (const [frequency, delay] of [[660, 0], [880, 0.11]] as const) {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start(context.currentTime + delay)
      oscillator.stop(context.currentTime + delay + 0.16)
    }
    window.setTimeout(() => void context.close(), 550)
  } catch {
    // Browsers may keep audio locked until the first user interaction.
  }
}

export function TypingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-500" role="status" aria-live="polite">
      <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
        {[0, 1, 2].map(index => (
          <span
            key={index}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </span>
      {label}
    </div>
  )
}
