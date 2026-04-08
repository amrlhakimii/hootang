interface ProgressBarProps {
  value: number // 0–100
  color?: string
}

export function ProgressBar({ value, color = '#00ADB5' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="w-full bg-[#222831] rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  )
}
