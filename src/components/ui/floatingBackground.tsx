import { useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'

const SYMBOLS = ['RM', '$', '¥', '€', '₿', '◇', '○', '+', '△', '×', '◈', '⬡']

export function FloatingBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  const elements = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[i % SYMBOLS.length],
      left: 2 + Math.random() * 94,
      top: 2 + Math.random() * 93,
      size: 10 + Math.random() * 15,
      baseOpacity: 0.035 + Math.random() * 0.07,
      isTeal: Math.random() > 0.45,
    }))
  , [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const items = Array.from(container.children) as HTMLElement[]

    items.forEach((item) => {
      const dur = 9 + Math.random() * 14
      const yAmt = 28 + Math.random() * 42
      const xAmt = -22 + Math.random() * 44
      const rot = -20 + Math.random() * 40

      gsap.to(item, {
        y: -yAmt,
        x: xAmt,
        rotation: rot,
        duration: dur,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -Math.random() * dur,
      })

      gsap.to(item, {
        opacity: `+=${0.04 + Math.random() * 0.04}`,
        duration: 3 + Math.random() * 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: -Math.random() * 5,
      })
    })

    return () => { items.forEach((item) => gsap.killTweensOf(item)) }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {elements.map((el) => (
        <span
          key={el.id}
          className="absolute select-none font-bold leading-none"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            fontSize: `${el.size}px`,
            opacity: el.baseOpacity,
            color: el.isTeal ? '#00ADB5' : '#EEEEEE',
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {el.symbol}
        </span>
      ))}
    </div>
  )
}
