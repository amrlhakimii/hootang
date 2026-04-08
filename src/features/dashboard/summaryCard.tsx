import { type ReactNode } from 'react'

interface SummaryCardProps {
  icon: ReactNode
  label: string
  value: string | number
  color?: string
}

export function SummaryCard({ icon, label, value, color = '#00ADB5' }: SummaryCardProps) {
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${color}18 0%, rgba(57,62,70,0.6) 100%)`,
        border: `1px solid ${color}25`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <p
        style={{ fontFamily: "'Syne', sans-serif", color }}
        className="text-3xl font-extrabold leading-none mb-1"
      >
        {value}
      </p>
      <p className="text-[#EEEEEE]/40 text-xs font-medium">{label}</p>
    </div>
  )
}
