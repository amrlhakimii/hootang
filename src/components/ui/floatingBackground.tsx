import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'

const SYMBOLS = ['RM', '$', '₿', '◇', '+', '△', '○', '×', '¥', '€', '◈', '⬡']

export function FloatingBackground() {
  const blobsRef = useRef<HTMLDivElement>(null)
  const symbolsRef = useRef<HTMLDivElement>(null)

  // large watermark symbols + small glowing ones
  const watermarks = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[(i * 2) % SYMBOLS.length],
      left: 5 + (i * 17) % 88,
      top: 8 + (i * 23) % 82,
      size: 72 + (i * 17) % 60,
    }))
  , [])

  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      left: 3 + (i * 6.3) % 92,
      top: 4 + (i * 7.1) % 90,
      size: 13 + (i * 3) % 14,
      isTeal: i % 3 !== 0,
    }))
  , [])

  // Animate blobs
  useEffect(() => {
    const container = blobsRef.current
    if (!container) return
    const blobs = Array.from(container.children) as HTMLElement[]

    blobs.forEach((blob, i) => {
      const dur = 18 + i * 7
      gsap.to(blob, {
        x: -40 + i * 25,
        y: -30 + i * 20,
        scale: 0.88 + i * 0.08,
        duration: dur,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -i * 4,
      })
    })
    return () => { blobs.forEach(b => gsap.killTweensOf(b)) }
  }, [])

  // Animate symbols
  useEffect(() => {
    const container = symbolsRef.current
    if (!container) return
    const items = Array.from(container.children) as HTMLElement[]

    items.forEach((item, i) => {
      const dur = 10 + (i * 4.3) % 14
      gsap.to(item, {
        y: -(30 + (i * 11) % 50),
        x: -18 + (i * 7) % 36,
        rotation: -22 + (i * 9) % 44,
        duration: dur,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -((i * 3.7) % dur),
      })
      // opacity pulse
      gsap.to(item, {
        opacity: `*=1.6`,
        duration: 2.5 + (i * 1.1) % 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -((i * 2.3) % 4),
      })
    })
    return () => { items.forEach(item => gsap.killTweensOf(item)) }
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Glowing blobs */}
      <div ref={blobsRef}>
        <div
          className="absolute"
          style={{
            top: '-10%', right: '-8%',
            width: '60vw', height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,173,181,0.18) 0%, transparent 65%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-12%', left: '-10%',
            width: '55vw', height: '55vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '35%', left: '20%',
            width: '40vw', height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,173,181,0.09) 0%, transparent 65%)',
            filter: 'blur(12px)',
          }}
        />
      </div>

      {/* Large watermark symbols */}
      {watermarks.map((w) => (
        <span
          key={`w-${w.id}`}
          className="absolute select-none font-black leading-none"
          style={{
            left: `${w.left}%`,
            top: `${w.top}%`,
            fontSize: `${w.size}px`,
            opacity: 0.032,
            color: '#00ADB5',
            fontFamily: "'Syne', sans-serif",
            transform: `rotate(${-15 + (w.id * 12) % 30}deg)`,
          }}
        >
          {w.symbol}
        </span>
      ))}

      {/* Animated particles */}
      <div ref={symbolsRef}>
        {particles.map((p) => (
          <span
            key={`p-${p.id}`}
            className="absolute select-none font-bold leading-none"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size}px`,
              opacity: p.isTeal ? 0.14 : 0.07,
              color: p.isTeal ? '#00ADB5' : '#EEEEEE',
              fontFamily: "'Syne', sans-serif",
              textShadow: p.isTeal ? '0 0 12px rgba(0,173,181,0.6), 0 0 28px rgba(0,173,181,0.3)' : 'none',
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>
    </div>
  )
}
