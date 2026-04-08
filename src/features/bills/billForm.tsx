import { useState } from 'react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type BillCategory } from '../../types/bill'

interface BillFormProps {
  onSubmit: (data: {
    name: string
    amount: number
    dueDate: string
    category: BillCategory
    recurring: boolean
  }) => void
  onCancel: () => void
}

const categories: { value: BillCategory; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'internet', label: 'Internet' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'mobile', label: 'Mobile Plan' },
  { value: 'other', label: 'Other' },
]

export function BillForm({ onSubmit, onCancel }: BillFormProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<BillCategory>('other')
  const [recurring, setRecurring] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !amount) return
    onSubmit({ name: name.trim(), amount: parseFloat(amount), dueDate, category, recurring })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Bill Name</Label>
        <Input id="name" placeholder="e.g. TNB Bill" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount (RM)</Label>
          <Input id="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as BillCategory)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="accent-[#00ADB5] w-4 h-4"
        />
        <span className="text-[#EEEEEE]/70 text-sm">Recurring bill</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Add Bill</Button>
      </div>
    </form>
  )
}
