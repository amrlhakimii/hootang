import { useState } from 'react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type SpendingCategory } from '../../types/spending'

interface SpendingFormProps {
  onSubmit: (data: { description: string; amount: number; category: SpendingCategory; date: string }) => void
  onCancel: () => void
}

const categories: { value: SpendingCategory; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'bills', label: 'Bills' },
  { value: 'other', label: 'Other' },
]

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SpendingForm({ onSubmit, onCancel }: SpendingFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<SpendingCategory>('food')
  const [date, setDate] = useState(today())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    onSubmit({ description: description.trim(), amount: parseFloat(amount), category, date })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">What did you spend on?</Label>
        <Input id="description" placeholder="e.g. Lunch at mamak" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount (RM)</Label>
          <Input id="amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as SpendingCategory)}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Add Spending</Button>
      </div>
    </form>
  )
}
