interface PercentageSplitProps {
  participants: string[]
  percentages: Record<string, number>
  onChange: (percentages: Record<string, number>) => void
}

export function PercentageSplit({ participants, percentages, onChange }: PercentageSplitProps) {
  const total = participants.reduce((sum, p) => sum + (percentages[p] ?? 0), 0)
  const remaining = 100 - total
  const isValid = Math.abs(remaining) < 0.01

  const handleChange = (name: string, value: string) => {
    onChange({ ...percentages, [name]: parseFloat(value) || 0 })
  }

  const distributeEvenly = () => {
    const even = Math.floor(100 / participants.length)
    const remainder = 100 - even * participants.length
    const next: Record<string, number> = {}
    participants.forEach((p, i) => { next[p] = i === 0 ? even + remainder : even })
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${isValid ? 'text-green-400' : 'text-yellow-400'}`}>
          {isValid ? '✓ Total: 100%' : `Remaining: ${remaining.toFixed(1)}%`}
        </p>
        <button type="button" onClick={distributeEvenly} className="text-xs text-[#00ADB5] hover:underline cursor-pointer">
          Distribute evenly
        </button>
      </div>
      {participants.map((person) => (
        <div key={person} className="flex items-center gap-3 bg-[#222831] rounded-xl px-3 py-2">
          <span className="text-[#EEEEEE] text-sm flex-1">{person}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentages[person] ?? ''}
              onChange={(e) => handleChange(person, e.target.value)}
              className="w-16 bg-[#393E46] text-[#EEEEEE] text-sm text-right rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-[#00ADB5]"
            />
            <span className="text-[#EEEEEE]/50 text-sm">%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
