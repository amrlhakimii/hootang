interface BadgeProps {
  children: React.ReactNode
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'muted'
}

const variants = {
  accent: 'bg-[#00ADB5]/20 text-[#00ADB5]',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  muted: 'bg-[#EEEEEE]/10 text-[#EEEEEE]/50',
}

export function Badge({ children, variant = 'muted' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
