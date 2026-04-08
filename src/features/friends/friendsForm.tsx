import { useState } from 'react'
import { Input, Textarea, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type Friend } from '../../types/friend'

interface FriendsFormProps {
  initial?: Friend
  onSubmit: (name: string, notes: string) => void
  onCancel: () => void
}

export function FriendsForm({ initial, onSubmit, onCancel }: FriendsFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), notes)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Friend's name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} placeholder="Optional note (e.g. roommate, colleague)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{initial ? 'Update' : 'Add Friend'}</Button>
      </div>
    </form>
  )
}
