import { type ReactNode } from 'react'

interface NavbarProps {
  title: string
  action?: ReactNode
}

export function Navbar({ title, action }: NavbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl md:text-2xl font-extrabold text-[#EEEEEE] truncate mr-4 tracking-tight">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  )
}
