import { useState } from 'react'
import { Repeat } from 'lucide-react'
import { Input, Select, Label } from '../../components/layout/input'
import { Button } from '../../components/layout/button'
import { type Spending, type SpendingCategory, type PaymentMethod, type ShopeePayMethod } from '../../types/spending'

interface SpendingFormProps {
  initial?: Spending
  onSubmit: (data: {
    description: string
    amount: number
    category: SpendingCategory
    date: string
    paymentMethod: PaymentMethod
    shopeeMethod?: ShopeePayMethod
    recurring?: boolean
  }) => void
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

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'qr', label: 'QR Pay' },
  { value: 'tng', label: "Touch 'n Go" },
  { value: 'shopee', label: 'ShopeePay' },
]

const shopeeMethods: { value: ShopeePayMethod; label: string }[] = [
  { value: 'wallet', label: 'Wallet (direct)' },
  { value: 'spaylater_1', label: 'SPayLater · 1 month' },
  { value: 'spaylater_3', label: 'SPayLater · 3 months' },
  { value: 'spaylater_6', label: 'SPayLater · 6 months' },
]

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SpendingForm({ initial, onSubmit, onCancel }: SpendingFormProps) {
  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState<SpendingCategory>(initial?.category ?? 'food')
  const [date, setDate] = useState(initial?.date ?? today())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initial?.paymentMethod ?? 'cash')
  const [shopeeMethod, setShopeeMethod] = useState<ShopeePayMethod>(initial?.shopeeMethod ?? 'wallet')
  const [recurring, setRecurring] = useState(initial?.recurring ?? false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date,
      paymentMethod,
      ...(paymentMethod === 'shopee' ? { shopeeMethod } : {}),
      ...(recurring ? { recurring: true } : {}),
    })
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

      <div>
        <Label htmlFor="paymentMethod">Paid with</Label>
        <Select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          {paymentMethods.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </Select>
      </div>

      {paymentMethod === 'shopee' && (
        <div>
          <Label htmlFor="shopeeMethod">ShopeePay method</Label>
          <Select id="shopeeMethod" value={shopeeMethod} onChange={(e) => setShopeeMethod(e.target.value as ShopeePayMethod)}>
            {shopeeMethods.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
      )}

      <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,173,181,0.06)', border: '1px solid rgba(0,173,181,0.15)' }}>
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-[#00ADB5] w-4 h-4" />
        <Repeat size={14} className="text-[#00ADB5]/70 shrink-0" />
        <span className="text-[#EEEEEE]/70 text-xs font-medium">Repeats every month</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{initial ? 'Save Changes' : 'Add Spending'}</Button>
      </div>
    </form>
  )
}
