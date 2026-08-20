import { useMemo, useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Wallet, Receipt as ReceiptIcon, TrendingUp } from 'lucide-react'
import { gsap } from 'gsap'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { EmptyState } from '../../components/layout/emptyState'
import { useBills } from '../../hooks/useBills'
import { useSubscriptions } from '../../hooks/useSubscription'
import { useReceipts } from '../../hooks/useReceipt'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { getCurrentMonth, formatMonth } from '../../utils/formatDate'

const categoryColors: Record<string, string> = {
  rent: '#8b5cf6',
  internet: '#00ADB5',
  utilities: '#f59e0b',
  mobile: '#ec4899',
  subscription: '#a78bfa',
  food: '#fb923c',
  transport: '#38bdf8',
  accommodation: '#34d399',
  entertainment: '#f472b6',
  shopping: '#facc15',
  other: '#6b7280',
}

function colorFor(category: string) {
  return categoryColors[category] || '#6b7280'
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface SpendItem {
  id: string
  category: string
  description: string
  amount: number
  date: string
}

export function SpendingPage() {
  const { bills } = useBills()
  const { subscriptions } = useSubscriptions()
  const { receipts } = useReceipts()
  const [month, setMonth] = useState(getCurrentMonth())
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = statsRef.current ? Array.from(statsRef.current.children) : []
    if (!cards.length) return
    gsap.fromTo(cards,
      { opacity: 0, y: 22, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)', stagger: 0.09 }
    )
    return () => { gsap.killTweensOf(cards); gsap.set(cards, { clearProps: 'all' }) }
  }, [month])

  const items = useMemo<SpendItem[]>(() => {
    const [year, mon] = month.split('-').map(Number)

    const billItems = bills
      .filter((b) => {
        if (!b.dueDate) return false
        const d = new Date(b.dueDate)
        return d.getFullYear() === year && d.getMonth() === mon - 1
      })
      .map((b) => ({ id: b.id, category: b.category, description: b.name, amount: b.amount, date: b.dueDate }))

    const subItems = subscriptions
      .filter((s) => {
        if (!s.startDate) return false
        const start = new Date(s.startDate)
        const startKey = start.getFullYear() * 12 + start.getMonth()
        const monthKey = year * 12 + (mon - 1)
        if (monthKey < startKey) return false
        if (s.billingCycle === 'yearly') return start.getMonth() === mon - 1
        return true
      })
      .map((s) => ({ id: s.id, category: 'subscription', description: s.name, amount: s.totalAmount, date: `${month}-01` }))

    const receiptItems = receipts
      .filter((r) => {
        if (!r.date) return false
        const d = new Date(r.date)
        return d.getFullYear() === year && d.getMonth() === mon - 1
      })
      .map((r) => ({
        id: r.id,
        category: r.category,
        description: r.title,
        amount: r.items.reduce((sum, i) => sum + i.price, 0) * (1 + r.tax / 100 + r.serviceCharge / 100),
        date: r.date,
      }))

    return [...billItems, ...subItems, ...receiptItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bills, subscriptions, receipts, month])

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) || 0) + item.amount)
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [items])

  const topCategory = byCategory[0]?.category

  return (
    <PageContainer>
      <Navbar title="Spending" />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">See where your money actually goes.</p>

      <div className="flex items-center justify-between mb-6 rounded-2xl px-4 py-3" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
        <button onClick={() => setMonth((m) => shiftMonth(m, -1))} className="p-1.5 rounded-lg text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-white/5 cursor-pointer">
          <ChevronLeft size={18} />
        </button>
        <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-[#EEEEEE] text-sm">{formatMonth(month)}</p>
        <button
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          disabled={month >= getCurrentMonth()}
          className="p-1.5 rounded-lg text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-white/5 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="col-span-2 md:col-span-1 rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #f8717118 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #f8717125' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#f8717120' }}>
            <Wallet size={16} color="#f87171" />
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", color: '#f87171' }} className="text-lg md:text-2xl font-extrabold leading-none mb-1 truncate">{formatCurrency(total)}</p>
          <p className="text-[#EEEEEE]/40 text-xs font-medium">Total spent</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #00ADB518 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #00ADB525' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#00ADB520' }}>
            <ReceiptIcon size={16} color="#00ADB5" />
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", color: '#00ADB5' }} className="text-lg md:text-2xl font-extrabold leading-none mb-1">{items.length}</p>
          <p className="text-[#EEEEEE]/40 text-xs font-medium">Transactions</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: `linear-gradient(145deg, ${colorFor(topCategory || 'other')}18 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${colorFor(topCategory || 'other')}25` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${colorFor(topCategory || 'other')}20` }}>
            <TrendingUp size={16} color={colorFor(topCategory || 'other')} />
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", color: colorFor(topCategory || 'other') }} className="text-lg md:text-2xl font-extrabold leading-none mb-1 truncate capitalize">{topCategory || '-'}</p>
          <p className="text-[#EEEEEE]/40 text-xs font-medium">Top category</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="💸" title="No spending yet" description="Bills, subscriptions and receipts for this month will show up here" />
      ) : (
        <>
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
            <p className="text-[#EEEEEE]/40 text-[10px] font-semibold uppercase tracking-widest mb-3">By category</p>
            <div className="space-y-3">
              {byCategory.map(({ category, amount }) => {
                const pct = total > 0 ? (amount / total) * 100 : 0
                const color = colorFor(category)
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#EEEEEE]/70 text-xs font-medium capitalize">{category}</span>
                      <span className="text-[#EEEEEE]/50 text-xs font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-[#222831] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
            {items.map((item) => {
              const color = colorFor(item.category)
              return (
                <div key={item.category + item.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#EEEEEE] text-sm font-medium truncate">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[#EEEEEE]/30 text-xs">{formatDate(item.date)}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ background: `${color}18`, color }}>{item.category}</span>
                    </div>
                  </div>
                  <p className="font-bold text-sm shrink-0 text-red-400">{formatCurrency(item.amount)}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </PageContainer>
  )
}
