import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Input } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { useFriends } from '../../hooks/useFriends'

interface RandomPickerProps {
  names: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
}

const avatarColors = ['#00ADB5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function RandomPicker({ names, onAdd, onRemove }: RandomPickerProps) {
  const { friends } = useFriends()
  const [custom, setCustom] = useState('')

  const handleAddCustom = () => {
    if (custom.trim() && !names.includes(custom.trim())) {
      onAdd(custom.trim())
      setCustom('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Friends list */}
      {friends.length > 0 && (
        <div>
          <p className="text-[#EEEEEE]/40 text-xs uppercase tracking-wider mb-2">Quick add from friends</p>
          <div className="flex flex-wrap gap-2">
            {friends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => names.includes(f.name) ? onRemove(f.name) : onAdd(f.name)}
                className={`px-3 py-1.5 rounded-xl text-sm transition-all cursor-pointer ${
                  names.includes(f.name)
                    ? 'bg-[#00ADB5] text-[#222831] font-medium'
                    : 'bg-[#222831] text-[#EEEEEE]/50 hover:text-[#EEEEEE]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom */}
      <div>
        <p className="text-[#EEEEEE]/40 text-xs uppercase tracking-wider mb-2">Add custom</p>
        <div className="flex gap-2">
          <Input
            placeholder="Enter name"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() } }}
          />
          <Button type="button" variant="secondary" onClick={handleAddCustom}>
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Selected names */}
      {names.length > 0 && (
        <div>
          <p className="text-[#EEEEEE]/40 text-xs uppercase tracking-wider mb-2">In the pool ({names.length})</p>
          <div className="flex flex-wrap gap-2">
            {names.map((name, i) => (
              <span
                key={name}
                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl font-medium"
                style={{ backgroundColor: `${avatarColors[i % avatarColors.length]}25`, color: avatarColors[i % avatarColors.length] }}
              >
                {name}
                <button type="button" onClick={() => onRemove(name)} className="cursor-pointer opacity-60 hover:opacity-100">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
