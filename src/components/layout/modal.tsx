import { type ReactNode, useEffect, useRef } from 'react'
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

    gsap.from(backdropRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power1.out',
    })

    if (isMobile) {
      gsap.from(sheetRef.current, {
        y: '100%',
        duration: 0.35,
        ease: 'power3.out',
      })
    } else {
      gsap.from(sheetRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 12,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
      onClick={onClose}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={sheetRef}
        className="relative bg-[#393E46] w-full md:max-w-md shadow-2xl border-t md:border border-[#00ADB5]/20 rounded-t-2xl md:rounded-2xl max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#222831] shrink-0">
          <h2 className="text-[#EEEEEE] font-semibold text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#EEEEEE]/40 hover:text-[#EEEEEE] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 pb-28 md:pb-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
