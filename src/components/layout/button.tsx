import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-gradient-to-r from-[#00ADB5] to-[#008f96] hover:from-[#00c2cb] hover:to-[#00ADB5] text-[#222831] font-semibold shadow-[0_4px_14px_rgba(0,173,181,0.3)]',
  secondary: 'bg-[#393E46]/80 hover:bg-[#44494f] text-[#EEEEEE] border border-white/8',
  danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20',
  ghost: 'bg-transparent hover:bg-white/5 text-[#EEEEEE]/60 hover:text-[#EEEEEE]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
