import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type ReceiptItem } from '../../types/receipt'
import { generateID } from '../../utils/generateID'

interface ItemFormProps {
  onAdd: (item: ReceiptItem) => void
}

export function ItemForm({ onAdd }: ItemFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleAdd = () => {
    if (!name.trim() || !price) return
    onAdd({ id: generateID(), name: name.trim(), price: parseFloat(price), assignedTo: [] })
    setName('')
    setPrice('')
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input placeholder="Item name (e.g. Burger)" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="w-28">
        <Input type="number" min="0.01" step="0.01" placeholder="RM" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <Button type="button" onClick={handleAdd} variant="secondary">
        <Plus size={14} />
      </Button>
    </div>
  )
}
