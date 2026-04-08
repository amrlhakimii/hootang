import { useState } from 'react'
import { X } from 'lucide-react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { Tabs } from '../../components/layout/tabs'
import { ItemForm } from './itemForm'
import { AssignPeople } from './assignPeople'
import { SplitSummary } from './splitSummary'
import { type Receipt, type ReceiptItem, type SplitMode } from '../../types/receipt'
import { useFriends } from '../../hooks/useFriends'
import { formatCurrency } from '../../utils/formatCurrency'

interface ReceiptFormProps {
  onSave: (data: Omit<Receipt, 'id'>) => void
  onCancel: () => void
}

const splitTabs = [
  { id: 'equal', label: 'Equal Split' },
  { id: 'itemized', label: 'Itemized' },
]

export function ReceiptForm({ onSave, onCancel }: ReceiptFormProps) {
  const { friends } = useFriends()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [tax, setTax] = useState('6')
  const [serviceCharge, setServiceCharge] = useState('10')
  const [participants, setParticipants] = useState<string[]>([])
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [customName, setCustomName] = useState('')
  const [step, setStep] = useState<'setup' | 'summary'>('setup')

  const addParticipant = (name: string) => {
    if (name && !participants.includes(name)) setParticipants((p) => [...p, name])
  }

  const removeParticipant = (name: string) => {
    setParticipants((p) => p.filter((n) => n !== name))
    setItems((prev) => prev.map((item) => ({
      ...item,
      assignedTo: item.assignedTo.filter((n) => n !== name),
    })))
  }

  const toggleAssign = (itemId: string, person: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              assignedTo: item.assignedTo.includes(person)
                ? item.assignedTo.filter((n) => n !== person)
                : [...item.assignedTo, person],
            }
      )
    )
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const receiptData: Omit<Receipt, 'id'> = {
    title: title || 'Receipt',
    items,
    tax: parseFloat(tax) || 0,
    serviceCharge: parseFloat(serviceCharge) || 0,
    participants,
    splitMode,
    date: new Date().toISOString().split('T')[0],
  }

  const canProceed = items.length > 0 && participants.length > 0

  if (step === 'summary') {
    return (
      <div className="space-y-4">
        <SplitSummary receipt={receiptData} />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep('setup')} className="flex-1">Back</Button>
          <Button onClick={() => onSave(receiptData)} className="flex-1">Save Receipt</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <Label htmlFor="title">Receipt Title</Label>
        <Input id="title" placeholder="e.g. Dinner at KLCC" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Items */}
      <div>
        <Label>Items</Label>
        <div className="space-y-2 mb-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-[#222831] rounded-xl px-3 py-2">
              <span className="text-[#EEEEEE] text-sm">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#00ADB5] text-sm">{formatCurrency(item.price)}</span>
                <button onClick={() => removeItem(item.id)} className="text-[#EEEEEE]/30 hover:text-red-400 cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <ItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
      </div>

      {/* Tax & service */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="tax">Tax (%)</Label>
          <Input id="tax" type="number" min="0" step="0.5" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="service">Service Charge (%)</Label>
          <Input id="service" type="number" min="0" step="0.5" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
        </div>
      </div>

      {/* Participants */}
      <div>
        <Label>Who's splitting?</Label>
        <div className="flex gap-2 mb-2">
          <Select onChange={(e) => { if (e.target.value) { addParticipant(e.target.value); e.target.value = '' } }}>
            <option value="">Add from friends...</option>
            {friends.filter((f) => !participants.includes(f.name)).map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Custom name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <Button type="button" variant="secondary" onClick={() => { addParticipant(customName); setCustomName('') }}>Add</Button>
        </div>
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {participants.map((p) => (
              <span key={p} className="flex items-center gap-1 bg-[#00ADB5]/20 text-[#00ADB5] text-xs px-2 py-1 rounded-full">
                {p}
                <button type="button" onClick={() => removeParticipant(p)} className="cursor-pointer"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Split mode */}
      <div>
        <Label>Split Method</Label>
        <Tabs tabs={splitTabs} active={splitMode} onChange={(v) => setSplitMode(v as SplitMode)} />
      </div>

      {/* Itemized assignment */}
      {splitMode === 'itemized' && participants.length > 0 && (
        <div>
          <Label>Assign Items</Label>
          <AssignPeople items={items} participants={participants} onToggle={toggleAssign} />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button
          type="button"
          onClick={() => setStep('summary')}
          disabled={!canProceed}
          className="flex-1"
        >
          Calculate Split
        </Button>
      </div>
    </div>
  )
}
