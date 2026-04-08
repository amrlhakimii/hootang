import { type ReceiptItem } from '../../types/receipt'
import { formatCurrency } from '../../utils/formatCurrency'

interface AssignPeopleProps {
  items: ReceiptItem[]
  participants: string[]
  onToggle: (itemId: string, person: string) => void
}

export function AssignPeople({ items, participants, onToggle }: AssignPeopleProps) {
  if (items.length === 0 || participants.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="bg-[#222831] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#EEEEEE] text-sm font-medium">{item.name}</p>
            <p className="text-[#00ADB5] text-sm font-semibold">{formatCurrency(item.price)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {participants.map((person) => {
              const assigned = item.assignedTo.includes(person)
              return (
                <button
                  key={person}
                  type="button"
                  onClick={() => onToggle(item.id, person)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    assigned
                      ? 'bg-[#00ADB5] text-[#222831]'
                      : 'bg-[#393E46] text-[#EEEEEE]/50 hover:text-[#EEEEEE]'
                  }`}
                >
                  {person}
                </button>
              )
            })}
          </div>
          {item.assignedTo.length > 0 && (
            <p className="text-[#EEEEEE]/30 text-xs mt-1">
              {formatCurrency(item.price / item.assignedTo.length)} each
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
