import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 ${onClick ? 'cursor-pointer transition-all hover:border-[#00ADB5]/40' : ''} ${className}`}
      style={{
        background: 'rgba(57,62,70,0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(238,238,238,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      {children}
    </div>
  )
}
