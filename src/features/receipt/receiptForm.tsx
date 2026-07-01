import { useRef, useState } from 'react'
import { Camera, Check, X } from 'lucide-react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { Tabs } from '../../components/layout/tabs'
import { ItemForm } from './itemForm'
import { AssignPeople } from './assignPeople'
import { PercentageSplit } from './percentageSplit'
import { SplitSummary } from './splitSummary'
import { type Receipt, type ReceiptItem, type SplitMode, type ReceiptCategory } from '../../types/receipt'
import { useFriends } from '../../hooks/useFriends'
import { formatCurrency } from '../../utils/formatCurrency'
import { scanReceipt, fileToBase64 } from '../../utils/scanReceipt'
import { generateID } from '../../utils/generateID'

interface ReceiptFormProps {
  onSave: (data: Omit<Receipt, 'id'>) => void
  onCancel: () => void
  initialData?: Omit<Receipt, 'id'>
}

const splitTabs = [
  { id: 'equal', label: 'Equal' },
  { id: 'itemized', label: 'Itemized' },
  { id: 'percentage', label: 'Custom %' },
]

const CATEGORIES: { value: ReceiptCategory; label: string }[] = [
  { value: 'food', label: '🍜 Food & Drinks' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'utilities', label: '⚡ Utilities' },
  { value: 'other', label: '📦 Other' },
]

export function ReceiptForm({ onSave, onCancel, initialData }: ReceiptFormProps) {
  const { friends } = useFriends()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [items, setItems] = useState<ReceiptItem[]>(initialData?.items ?? [])
  const [tax, setTax] = useState(String(initialData?.tax ?? 6))
  const [serviceCharge, setServiceCharge] = useState(String(initialData?.serviceCharge ?? 10))
  const [discount, setDiscount] = useState(String(initialData?.discount ?? 0))
  const [participants, setParticipants] = useState<string[]>(initialData?.participants ?? [])
  const [splitMode, setSplitMode] = useState<SplitMode>(initialData?.splitMode ?? 'equal')
  const [percentages, setPercentages] = useState<Record<string, number>>(initialData?.percentages ?? {})
  const [paidBy, setPaidBy] = useState(initialData?.paidBy ?? '')
  const [category, setCategory] = useState<ReceiptCategory>(initialData?.category ?? 'food')
  const [customName, setCustomName] = useState('')
  const [step, setStep] = useState<'setup' | 'summary'>('setup')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ name: '', price: '', quantity: '' })

  const startEdit = (item: ReceiptItem) => {
    setEditingId(item.id)
    setEditDraft({ name: item.name, price: String(item.price), quantity: String(item.quantity ?? 1) })
  }

  const commitEdit = () => {
    if (!editingId) return
    setItems((prev) => prev.map((item) =>
      item.id !== editingId ? item : {
        ...item,
        name: editDraft.name.trim() || item.name,
        price: parseFloat(editDraft.price) || item.price,
        quantity: Math.max(1, parseInt(editDraft.quantity) || 1),
      }
    ))
    setEditingId(null)
  }

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanError('')
    setScanning(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await scanReceipt(base64, file.type)
      if (result.title) setTitle(result.title)
      if (result.items?.length) {
        setItems(result.items.map((item) => ({
          id: generateID(),
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          assignedTo: [],
        })))
      }
      if (result.tax) setTax(String(result.tax))
      if (result.serviceCharge) setServiceCharge(String(result.serviceCharge))
      if (result.discount) setDiscount(String(result.discount))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Scan error:', msg)
      setScanError(msg)
    } finally {
      setScanning(false)
      e.target.value = ''
    }
  }

  const addParticipant = (name: string) => {
    if (name && !participants.includes(name)) setParticipants((p) => [...p, name])
  }

  const removeParticipant = (name: string) => {
    setParticipants((p) => p.filter((n) => n !== name))
    setItems((prev) => prev.map((item) => ({
      ...item,
      assignedTo: item.assignedTo.filter((n) => n !== name),
    })))
    setPercentages((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    if (paidBy === name) setPaidBy('')
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

  const percentageTotal = participants.reduce((sum, p) => sum + (percentages[p] ?? 0), 0)
  const percentageValid = Math.abs(percentageTotal - 100) < 0.01

  const receiptData: Omit<Receipt, 'id'> = {
    title: title || 'Receipt',
    items,
    tax: parseFloat(tax) || 0,
    serviceCharge: parseFloat(serviceCharge) || 0,
    discount: parseFloat(discount) || 0,
    participants,
    splitMode,
    percentages,
    paidBy,
    category,
    settledBy: initialData?.settledBy ?? [],
    date: initialData?.date ?? new Date().toISOString().split('T')[0],
  }

  const canProceed =
    items.length > 0 &&
    participants.length > 0 &&
    (splitMode !== 'percentage' || percentageValid)

  if (step === 'summary') {
    return (
      <div className="space-y-4">
        <SplitSummary receipt={receiptData} />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep('setup')} className="flex-1">Back</Button>
          <Button onClick={() => onSave(receiptData)} className="flex-1">
            {initialData ? 'Update Receipt' : 'Save Receipt'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleScan}
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full flex items-center justify-center gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanning}
      >
        <Camera size={14} />
        {scanning ? 'Scanning...' : 'Scan Receipt'}
      </Button>
      {scanError && <p className="text-red-400 text-xs text-center">{scanError}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="title">Receipt Title</Label>
          <Input id="title" placeholder="e.g. Dinner at KLCC" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as ReceiptCategory)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Items */}
      <div>
        <Label>Items</Label>
        <div className="space-y-2 mb-2">
          {items.map((item) => {
            const qty = item.quantity ?? 1
            const total = item.price * qty

            if (editingId === item.id) {
              return (
                <div key={item.id} className="flex items-center gap-2 bg-[#222831] rounded-xl px-3 py-2">
                  <Input
                    className="flex-1 h-7 text-sm"
                    value={editDraft.name}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                    autoFocus
                  />
                  <Input
                    className="w-12 h-7 text-sm"
                    type="number"
                    min="1"
                    value={editDraft.quantity}
                    onChange={(e) => setEditDraft((d) => ({ ...d, quantity: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                    placeholder="Qty"
                  />
                  <Input
                    className="w-24 h-7 text-sm"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editDraft.price}
                    onChange={(e) => setEditDraft((d) => ({ ...d, price: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                    placeholder="Price"
                  />
                  <button onClick={commitEdit} className="text-[#00ADB5] hover:text-[#00ADB5]/70 cursor-pointer">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-[#EEEEEE]/30 hover:text-red-400 cursor-pointer">
                    <X size={13} />
                  </button>
                </div>
              )
            }

            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#222831] rounded-xl px-3 py-2 cursor-pointer"
                onClick={() => startEdit(item)}
              >
                <div>
                  <span className="text-[#EEEEEE] text-sm">{item.name}</span>
                  {qty > 1 && <span className="text-[#EEEEEE]/40 text-xs ml-2">{qty}×</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00ADB5] text-sm">{formatCurrency(total)}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeItem(item.id) }} className="text-[#EEEEEE]/30 hover:text-red-400 cursor-pointer">
                    <X size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <ItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
      </div>

      {/* Tax, service, discount */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="tax">Tax (%)</Label>
          <Input id="tax" type="number" min="0" step="0.5" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="service">Service (%)</Label>
          <Input id="service" type="number" min="0" step="0.5" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="discount">Discount (RM)</Label>
          <Input id="discount" type="number" min="0" step="0.50" value={discount} onChange={(e) => setDiscount(e.target.value)} />
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
          <Input
            placeholder="Custom name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addParticipant(customName); setCustomName('') } }}
          />
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

      {/* Paid by */}
      {participants.length > 0 && (
        <div>
          <Label htmlFor="paidBy">Paid by</Label>
          <Select id="paidBy" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            <option value="">Select who paid...</option>
            {participants.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
      )}

      {/* Split mode */}
      <div>
        <Label>Split Method</Label>
        <Tabs tabs={splitTabs} active={splitMode} onChange={(v) => setSplitMode(v as SplitMode)} />
      </div>

      {splitMode === 'itemized' && participants.length > 0 && (
        <div>
          <Label>Assign Items</Label>
          <AssignPeople items={items} participants={participants} onToggle={toggleAssign} />
        </div>
      )}

      {splitMode === 'percentage' && participants.length > 0 && (
        <div>
          <Label>Set Percentages</Label>
          <PercentageSplit participants={participants} percentages={percentages} onChange={setPercentages} />
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
          {splitMode === 'percentage' && !percentageValid && participants.length > 0
            ? `${percentageTotal.toFixed(0)}% / 100%`
            : 'Preview Split'}
        </Button>
      </div>
    </div>
  )
}
