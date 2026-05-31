import { type ReactNode, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface NavbarProps {
  title: string
  action?: ReactNode
}

export function Navbar({ title, action }: NavbarProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(el, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' })
    return () => { gsap.killTweensOf(el); gsap.set(el, { clearProps: 'all' }) }
  }, [])

  return (
    <div ref={ref} className="flex items-center justify-between mb-6">
      <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-2xl font-extrabold text-[#EEEEEE] truncate mr-4 tracking-tight">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  )
}
