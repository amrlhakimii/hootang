import { type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { gsap } from 'gsap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

// Header is padding 20px top+bottom + ~22px text ≈ 62px
const HEADER_H = 62

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !sheetRef.current || !backdropRef.current) return
    const isMobile = window.innerWidth < 768
    const sheet = sheetRef.current
    const backdrop = backdropRef.current

    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' })

    if (isMobile) {
      gsap.fromTo(sheet, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' })
    } else {
      gsap.fromTo(sheet, { opacity: 0, scale: 0.95, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    }

    return () => {
      gsap.killTweensOf(sheet)
      gsap.killTweensOf(backdrop)
      gsap.set(sheet, { clearProps: 'transform,opacity' })
      gsap.set(backdrop, { clearProps: 'opacity' })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      onClick={onClose}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        ref={sheetRef}
        className="relative w-full md:max-w-md shadow-2xl rounded-t-2xl md:rounded-2xl"
        style={{
          background: '#393E46',
          border: '1px solid rgba(0,173,181,0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '20px', borderBottom: '1px solid #222831' }}
        >
          <h2 className="text-[#EEEEEE] font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#EEEEEE]/40 hover:text-[#EEEEEE] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body — explicit maxHeight so Safari never collapses it */}
        <div
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px',
            paddingBottom: '32px',
            // total room = viewport - top notch - bottom indicator - 24px breathing - header
            maxHeight: `calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px - ${HEADER_H}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
