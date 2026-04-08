import { useState } from 'react'
import { X } from 'lucide-react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type BillingCycle, type Subscription, type SubscriptionParticipant } from '../../types/subscription'
import { useFriends } from '../../hooks/useFriends'
import { generateID } from '../../utils/generateID'

interface SubscriptionFormProps {
  onSubmit: (data: Omit<Subscription, 'id'>) => void
  onCancel: () => void
}

export function SubscriptionForm({ onSubmit, onCancel }: SubscriptionFormProps) {
  const { friends } = useFriends()
  const [name, setName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [participants, setParticipants] = useState<string[]>([])
  const [customName, setCustomName] = useState('')

  const addParticipant = (name: string) => {
    if (name && !participants.includes(name)) {
      setParticipants((prev) => [...prev, name])
    }
  }

  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !totalAmount || participants.length === 0) return

    const subParticipants: SubscriptionParticipant[] = participants.map((p) => ({
      friendId: friends.find((f) => f.name === p)?.id ?? generateID(),
      name: p,
      payments: [],
    }))

    onSubmit({ name: name.trim(), totalAmount: parseFloat(totalAmount), billingCycle, startDate, participants: subParticipants })
  }

  const presets = ['Spotify', 'Netflix', 'YouTube Premium', 'iCloud', 'Canva', 'Disney+']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Subscription Name</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setName(p)}
              className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer transition-colors ${
                name === p ? 'bg-[#00ADB5] text-[#222831]' : 'bg-[#222831] text-[#EEEEEE]/50 hover:text-[#EEEEEE]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <Input id="name" placeholder="Or type your own" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Total Amount (RM)</Label>
          <Input id="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="cycle">Billing Cycle</Label>
          <Select id="cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Participants</Label>
        <div className="flex gap-2 mb-2">
          <Select onChange={(e) => { if (e.target.value) { addParticipant(e.target.value); e.target.value = '' } }}>
            <option value="">Add from friends...</option>
            {friends.filter((f) => !participants.includes(f.name)).map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add custom name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => { addParticipant(customName); setCustomName('') }}
          >
            Add
          </Button>
        </div>
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {participants.map((p) => (
              <span key={p} className="flex items-center gap-1 bg-[#00ADB5]/20 text-[#00ADB5] text-xs px-2 py-1 rounded-full">
                {p}
                <button type="button" onClick={() => removeParticipant(p)} className="cursor-pointer">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Add Subscription</Button>
      </div>
    </form>
  )
}
