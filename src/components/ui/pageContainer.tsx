import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

export function PageContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    return () => { gsap.killTweensOf(el); gsap.set(el, { clearProps: 'all' }) }
  }, [])

  return (
    <div ref={ref} className="p-4 md:p-6 max-w-5xl mx-auto">
      {children}
    </div>
  )
}
