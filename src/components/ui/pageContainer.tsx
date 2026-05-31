import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

export function PageContainer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.out',
        clearProps: 'all',
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="p-4 md:p-6 max-w-5xl mx-auto">
      {children}
    </div>
  )
}
