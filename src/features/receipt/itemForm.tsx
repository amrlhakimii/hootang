import { useRef, useState } from 'react'
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
  const [quantity, setQuantity] = useState('1')
  const nameRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (!name.trim() || !price) return
    onAdd({
      id: generateID(),
      name: name.trim(),
      price: parseFloat(price),
      quantity: Math.max(1, parseInt(quantity) || 1),
      assignedTo: [],
    })
    setName('')
    setPrice('')
    setQuantity('1')
    nameRef.current?.focus()
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          ref={nameRef}
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        />
      </div>
      <div className="w-16">
        <Input
          type="number"
          min="1"
          step="1"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        />
      </div>
      <div className="w-28">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        />
      </div>
      <Button type="button" onClick={handleAdd} variant="secondary">
        <Plus size={14} />
      </Button>
    </div>
  )
}
