import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center select-none">
      {icon && (
        <div
          className="text-5xl mb-4 w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,173,181,0.08)', border: '1px solid rgba(0,173,181,0.12)' }}
        >
          {icon}
        </div>
      )}
      <p className="text-[#EEEEEE]/70 font-semibold text-base mb-1">{title}</p>
      {description && <p className="text-[#EEEEEE]/30 text-sm max-w-xs">{description}</p>}
    </div>
  )
}
