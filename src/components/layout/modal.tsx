import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { gsap } from 'gsap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

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
      gsap.fromTo(sheet, { y: '100%' }, { y: '0%', duration: 0.38, ease: 'power3.out' })
    } else {
      gsap.fromTo(sheet, { opacity: 0, scale: 0.96, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: 'power2.out' })
    }

    return () => {
      gsap.killTweensOf(sheet)
      gsap.killTweensOf(backdrop)
      gsap.set(sheet, { clearProps: 'transform,opacity' })
      gsap.set(backdrop, { clearProps: 'opacity' })
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center md:p-6"
      style={{
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0"
        style={{
          background: 'rgba(10,14,20,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full md:max-w-md rounded-t-[20px] md:rounded-[20px]"
        style={{
          background: '#2d3440',
          border: '1px solid rgba(0,173,181,0.2)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center md:hidden" style={{ paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(238,238,238,0.2)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-[#EEEEEE] font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#EEEEEE]/40 hover:text-[#EEEEEE] transition-colors cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scroll body */}
        <div
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '20px',
            paddingBottom: '32px',
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
