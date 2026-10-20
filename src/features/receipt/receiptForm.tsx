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
import { hasInvalidCustomAmounts } from '../../utils/calculateSplit'
import { generateID } from '../../utils/generateID'

interface ReceiptFormProps {
  onSave: (data: Omit<Receipt, 'id'>) => void
  onCancel: () => void
  initialData?: Omit<Receipt, 'id'>
}

const STEP_LABELS = ['Items', 'People', 'Split', 'Review']
const LAST_STEP = STEP_LABELS.length - 1

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

function omitKey(obj: Record<string, number>, key: string): Record<string, number> {
  const next = { ...obj }
  delete next[key]
  return next
}

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
  const [step, setStep] = useState(0)
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
      ...(item.customAmounts && { customAmounts: omitKey(item.customAmounts, name) }),
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
              ...(item.customAmounts && {
                customAmounts: item.assignedTo.includes(person)
                  ? omitKey(item.customAmounts, person)
                  : { ...item.customAmounts, [person]: 0 },
              }),
            }
      )
    )
  }

  const setCustomAmounts = (itemId: string, amounts: Record<string, number> | undefined) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const next = { ...item }
        if (amounts) next.customAmounts = amounts
        else delete next.customAmounts
        return next
      })
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

  const customInvalid = splitMode === 'itemized' && hasInvalidCustomAmounts(items)
  const percentInvalid = splitMode === 'percentage' && participants.length > 0 && !percentageValid

  // Reason the current step can't advance yet ('' when it can)
  let blockReason = ''
  if (step === 0 && items.length === 0) blockReason = 'Add at least one item to continue'
  else if (step === 1 && participants.length === 0) blockReason = 'Add at least one person to continue'
  else if (step === 2 && percentInvalid) blockReason = `Percentages total ${percentageTotal.toFixed(0)}%, need 100%`
  else if (step === 2 && customInvalid) blockReason = 'Unequal amounts must add up to each item total'
  else if (step === 2 && splitMode === 'itemized' && items.some((i) => i.assignedTo.length === 0)) blockReason = 'Assign every item to at least one person'

  const goNext = () => {
    if (blockReason) return
    commitEdit() // keep a half-finished item edit instead of silently dropping it
    setStep((s) => Math.min(LAST_STEP, s + 1))
  }
  const goBack = () => setStep((s) => Math.max(0, s - 1))

  const progress = (
    <div className="pb-1">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[#EEEEEE] text-sm font-medium">{STEP_LABELS[step]}</p>
        <p className="text-[#EEEEEE]/50 text-xs">Step {step + 1} of {STEP_LABELS.length}</p>
      </div>
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEP_LABELS.length} aria-valuenow={step + 1}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#00ADB5]' : 'bg-[#393E46]'}`} />
        ))}
      </div>
    </div>
  )

  if (step === LAST_STEP) {
    return (
      <div className="space-y-4">
        {progress}
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <SplitSummary receipt={receiptData} />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={goBack} className="flex-1 justify-center min-h-11">Back</Button>
          <Button onClick={() => onSave(receiptData)} className="flex-1 justify-center min-h-11">
            {initialData ? 'Update Receipt' : 'Save Receipt'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {progress}
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        {step === 0 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScan}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 min-h-11"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
            >
              <Camera size={14} />
              {scanning ? 'Scanning...' : 'Scan Receipt'}
            </Button>
            {scanError && <p className="text-red-400 text-xs text-center">{scanError}</p>}

            <div>
              <Label htmlFor="title">Receipt Title</Label>
              <Input id="title" className="min-h-11" placeholder="e.g. Dinner at KLCC" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label>Items</Label>
              <div className="space-y-2 mb-2">
                {items.map((item) => {
                  const qty = item.quantity ?? 1
                  const total = item.price * qty

                  if (editingId === item.id) {
                    return (
                      <div key={item.id} className="flex flex-wrap items-center gap-2 bg-[#222831] rounded-xl px-3 py-2">
                        <Input
                          className="basis-full min-h-11 text-sm"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                          autoFocus
                        />
                        <Input
                          className="w-16 min-h-11 text-sm"
                          type="number"
                          min="1"
                          value={editDraft.quantity}
                          onChange={(e) => setEditDraft((d) => ({ ...d, quantity: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                          placeholder="Qty"
                        />
                        <Input
                          className="flex-1 min-w-0 min-h-11 text-sm"
                          type="number"
                          min="0"
                          step="0.01"
                          value={editDraft.price}
                          onChange={(e) => setEditDraft((d) => ({ ...d, price: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit() }}
                          placeholder="Price"
                        />
                        <button type="button" aria-label="Save item" onClick={commitEdit} className="w-11 h-11 flex items-center justify-center text-[#00ADB5] hover:text-[#00ADB5]/70 cursor-pointer">
                          <Check size={16} />
                        </button>
                        <button type="button" aria-label="Cancel edit" onClick={() => setEditingId(null)} className="w-11 h-11 flex items-center justify-center text-[#EEEEEE]/40 hover:text-red-400 cursor-pointer">
                          <X size={16} />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 bg-[#222831] rounded-xl pl-3 pr-1 min-h-11 cursor-pointer"
                      onClick={() => startEdit(item)}
                    >
                      <div className="min-w-0 break-words py-2">
                        <span className="text-[#EEEEEE] text-sm">{item.name}</span>
                        {qty > 1 && <span className="text-[#EEEEEE]/50 text-xs ml-2">{qty}×</span>}
                      </div>
                      <div className="flex items-center shrink-0">
                        <span className="text-[#00ADB5] text-sm">{formatCurrency(total)}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                          className="w-11 h-11 flex items-center justify-center text-[#EEEEEE]/40 hover:text-red-400 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <ItemForm onAdd={(item) => setItems((prev) => [...prev, item])} />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input id="tax" className="min-h-11" type="number" min="0" step="0.5" value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="service">Service (%)</Label>
                <Input id="service" className="min-h-11" type="number" min="0" step="0.5" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="discount">Discount (RM)</Label>
                <Input id="discount" className="min-h-11" type="number" min="0" step="0.50" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <Label>Who's splitting?</Label>
              <div className="mb-2">
                <Select className="min-h-11" onChange={(e) => { if (e.target.value) { addParticipant(e.target.value); e.target.value = '' } }}>
                  <option value="">Add from friends...</option>
                  {friends.filter((f) => !participants.includes(f.name)).map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  className="min-h-11"
                  placeholder="Custom name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addParticipant(customName.trim()); setCustomName('') } }}
                />
                <Button type="button" variant="secondary" className="min-h-11 shrink-0" onClick={() => { addParticipant(customName.trim()); setCustomName('') }}>Add</Button>
              </div>
              {participants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {participants.map((p) => (
                    <span key={p} className="flex items-center bg-[#00ADB5]/20 text-[#00ADB5] text-xs pl-3 rounded-full max-w-full">
                      <span className="truncate py-1.5">{p}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${p}`}
                        onClick={() => removeParticipant(p)}
                        className="relative w-8 h-8 flex items-center justify-center cursor-pointer before:absolute before:-inset-y-1.5 before:-inset-x-0.5 before:content-['']"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {participants.length > 0 && (
              <div>
                <Label htmlFor="paidBy">Paid by</Label>
                <Select id="paidBy" className="min-h-11" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                  <option value="">Select who paid...</option>
                  {participants.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" className="min-h-11" value={category} onChange={(e) => setCategory(e.target.value as ReceiptCategory)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <Label>Split Method</Label>
              <Tabs tabs={splitTabs} active={splitMode} onChange={(v) => setSplitMode(v as SplitMode)} />
            </div>

            {splitMode === 'equal' && (
              <p className="text-[#EEEEEE]/50 text-sm">
                Everyone pays the same share of the total.
              </p>
            )}

            {splitMode === 'itemized' && participants.length > 0 && (
              <div>
                <Label>Assign Items</Label>
                <AssignPeople items={items} participants={participants} onToggle={toggleAssign} onSetCustomAmounts={setCustomAmounts} />
              </div>
            )}

            {splitMode === 'percentage' && participants.length > 0 && (
              <div>
                <Label>Set Percentages</Label>
                <PercentageSplit participants={participants} percentages={percentages} onChange={setPercentages} />
              </div>
            )}
          </>
        )}
      </div>

      <div>
        {blockReason && <p className="text-yellow-400 text-xs text-center mb-2" role="status">{blockReason}</p>}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={step === 0 ? onCancel : goBack}
            className="flex-1 justify-center min-h-11"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type="button"
            onClick={goNext}
            disabled={!!blockReason}
            className="flex-1 justify-center min-h-11"
          >
            {step === LAST_STEP - 1 ? 'Preview Split' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
