import { useState } from 'react'
import { type ReceiptItem } from '../../types/receipt'
import { formatCurrency } from '../../utils/formatCurrency'
import { getItemTotal, getCustomAmountsDiff } from '../../utils/calculateSplit'

function splitEvenly(total: number, people: string[]): Record<string, number> {
  const cents = Math.round(total * 100)
  const base = Math.floor(cents / people.length)
  const remainder = cents - base * people.length
  return Object.fromEntries(people.map((p, i) => [p, (base + (i < remainder ? 1 : 0)) / 100]))
}

function AmountInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(value ? String(value) : '')
  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      step="0.01"
      value={text}
      placeholder="0.00"
      onChange={(e) => {
        setText(e.target.value)
        onChange(Math.max(0, parseFloat(e.target.value) || 0))
      }}
      className="w-20 bg-[#393E46] text-[#EEEEEE] text-xs rounded-lg px-2 py-1 text-right outline-none focus:ring-1 focus:ring-[#00ADB5]"
    />
  )
}

interface AssignPeopleProps {
  items: ReceiptItem[]
  participants: string[]
  onToggle: (itemId: string, person: string) => void
  onSetCustomAmounts: (itemId: string, amounts: Record<string, number> | undefined) => void
}

export function AssignPeople({ items, participants, onToggle, onSetCustomAmounts }: AssignPeopleProps) {
  if (items.length === 0 || participants.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const qty = item.quantity ?? 1
        const itemTotal = getItemTotal(item)
        const diff = getCustomAmountsDiff(item)
        return (
          <div key={item.id} className="bg-[#222831] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[#EEEEEE] text-sm font-medium">{item.name}</p>
                {qty > 1 && (
                  <p className="text-[#EEEEEE]/40 text-xs">{qty} × {formatCurrency(item.price)}</p>
                )}
              </div>
              <p className="text-[#00ADB5] text-sm font-semibold">{formatCurrency(itemTotal)}</p>
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
            {item.assignedTo.length > 0 && !item.customAmounts && (
              <p className="text-[#EEEEEE]/30 text-xs mt-1">
                {formatCurrency(itemTotal / item.assignedTo.length)} each
              </p>
            )}
            {item.assignedTo.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  onSetCustomAmounts(item.id, item.customAmounts ? undefined : splitEvenly(itemTotal, item.assignedTo))
                }
                className="mt-2 text-xs text-[#00ADB5] hover:underline cursor-pointer"
              >
                {item.customAmounts ? 'Split equally' : 'Split unequally'}
              </button>
            )}
            {item.customAmounts && item.assignedTo.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {item.assignedTo.map((person) => (
                  <div key={person} className="flex items-center justify-between">
                    <span className="text-[#EEEEEE]/70 text-xs">{person}</span>
                    <div className="flex items-center gap-1 text-[#EEEEEE]/40 text-xs">
                      RM
                      <AmountInput
                        value={item.customAmounts?.[person] ?? 0}
                        onChange={(n) => onSetCustomAmounts(item.id, { ...item.customAmounts, [person]: n })}
                      />
                    </div>
                  </div>
                ))}
                <p className={`text-xs ${Math.abs(diff) > 0.005 ? 'text-red-400' : 'text-[#EEEEEE]/30'}`}>
                  {Math.abs(diff) > 0.005
                    ? diff > 0 ? `${formatCurrency(diff)} left to assign` : `${formatCurrency(-diff)} over`
                    : 'Fully assigned'}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
