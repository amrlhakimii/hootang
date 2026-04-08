import { useState } from 'react'
import { Input, Select, Textarea, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type LoanType } from '../../types/loan'
import { useFriends } from '../../hooks/useFriends'

interface LoanFormProps {
  onSubmit: (data: {
    person: string
    amount: number
    type: LoanType
    date: string
    dueDate: string
    notes: string
  }) => void
  onCancel: () => void
}

export function LoanForm({ onSubmit, onCancel }: LoanFormProps) {
  const { friends } = useFriends()
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<LoanType>('lent')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!person.trim() || !amount) return
    onSubmit({ person: person.trim(), amount: parseFloat(amount), type, date, dueDate, notes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="person">Person</Label>
        {friends.length > 0 ? (
          <Select
            id="person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            required
          >
            <option value="">Select a friend</option>
            {friends.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
            <option value="__custom">Other (type below)</option>
          </Select>
        ) : null}
        {(friends.length === 0 || person === '__custom') && (
          <Input
            id="person-custom"
            placeholder="Name"
            value={person === '__custom' ? '' : person}
            onChange={(e) => setPerson(e.target.value)}
            className="mt-2"
            required
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount (RM)</Label>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" value={type} onChange={(e) => setType(e.target.value as LoanType)}>
            <option value="lent">I lent money</option>
            <option value="borrowed">I borrowed money</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="What's this for?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Add Loan</Button>
      </div>
    </form>
  )
}
