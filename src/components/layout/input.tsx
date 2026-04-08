import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const baseClass =
  'w-full bg-[#222831] border border-[#393E46] text-[#EEEEEE] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00ADB5] transition-colors placeholder:text-[#EEEEEE]/30'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseClass} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${baseClass} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseClass} resize-none ${className}`} {...props} />
}

interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
}
export function Label({ children, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-xs text-[#EEEEEE]/50 mb-1 uppercase tracking-wider">
      {children}
    </label>
  )
}
