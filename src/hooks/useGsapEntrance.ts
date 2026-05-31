import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/** Fade + slide-up entrance for a container and its direct children */
export function useGsapEntrance(stagger = false) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      if (stagger) {
        gsap.from(ref.current!.children, {
          opacity: 0,
          y: 18,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.07,
          clearProps: 'all',
        })
      } else {
        gsap.from(ref.current, {
          opacity: 0,
          y: 18,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'all',
        })
      }
    }, ref)
    return () => ctx.revert()
  }, [stagger])

  return ref
}
