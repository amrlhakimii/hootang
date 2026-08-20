import { useMemo, useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Wallet, CalendarDays, TrendingUp, Plus, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { gsap } from 'gsap'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { EmptyState } from '../../components/layout/emptyState'
import { SpendingForm } from './spendingForm'
import { BillForm } from '../bills/billForm'
import { SubscriptionForm } from '../subscriptions/subscriptionForm'
import { useBills } from '../../hooks/useBills'
import { useSubscriptions } from '../../hooks/useSubscription'
import { useReceipts } from '../../hooks/useReceipt'
import { useSpendings } from '../../hooks/useSpending'
import { useAuth } from '../../context/AuthContext'
import { type Spending } from '../../types/spending'
import { type Bill } from '../../types/bill'
import { type Subscription } from '../../types/subscription'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { getCurrentMonth, formatMonth } from '../../utils/formatDate'
import { getCostPerPerson } from '../../utils/calculateSubscription'
import { calculateReceiptSplit } from '../../utils/calculateSplit'

const categoryColors: Record<string, string> = {
  rent: '#8b5cf6',
  internet: '#00ADB5',
  utilities: '#f59e0b',
  mobile: '#ec4899',
  subscription: '#a78bfa',
  food: '#fb923c',
  groceries: '#4ade80',
  transport: '#38bdf8',
  accommodation: '#34d399',
  entertainment: '#f472b6',
  shopping: '#facc15',
  health: '#f87171',
  bills: '#f59e0b',
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

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function monthKeyOf(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const paymentLabels: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  apple_pay: 'Apple Pay',
  qr: 'QR Pay',
  tng: "Touch 'n Go",
  shopee: 'ShopeePay',
}

const shopeeLabels: Record<string, string> = {
  wallet: 'Wallet',
  spaylater_1: 'SPayLater 1mo',
  spaylater_3: 'SPayLater 3mo',
  spaylater_6: 'SPayLater 6mo',
}

function paymentLabel(paymentMethod?: string, shopeeMethod?: string): string | undefined {
  if (!paymentMethod) return undefined
  if (paymentMethod === 'shopee' && shopeeMethod) return `ShopeePay · ${shopeeLabels[shopeeMethod] || shopeeMethod}`
  return paymentLabels[paymentMethod] || paymentMethod
}

interface SpendItem {
  id: string
  source: 'bill' | 'subscription' | 'receipt' | 'manual'
  category: string
  description: string
  amount: number
  date: string
  paymentMethod?: string
  shopeeMethod?: string
}

export function SpendingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ME = (user?.displayName ?? '').trim().toLowerCase()
  const { bills, updateBill, deleteBill } = useBills()
  const { subscriptions, updateSubscription, deleteSubscription } = useSubscriptions()
  const { receipts, deleteReceipt } = useReceipts()
  const { spendings, addSpending, updateSpending, deleteSpending } = useSpendings()
  const [month, setMonth] = useState(getCurrentMonth())
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [showModal, setShowModal] = useState(false)
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

  const buildItems = useMemo(() => {
    return (monthKey: string): SpendItem[] => {
      const [year, mon] = monthKey.split('-').map(Number)

      const billItems: SpendItem[] = bills
        .filter((b) => {
          if (!b.dueDate) return false
          const d = new Date(b.dueDate)
          return d.getFullYear() === year && d.getMonth() === mon - 1
        })
        .map((b) => ({ id: b.id, source: 'bill', category: b.category, description: b.name, amount: b.amount, date: b.dueDate }))

      const subItems: SpendItem[] = subscriptions
        .filter((s) => {
          if (!s.startDate) return false
          const start = new Date(s.startDate)
          const startKey = start.getFullYear() * 12 + start.getMonth()
          const targetKey = year * 12 + (mon - 1)
          if (targetKey < startKey) return false
          if (s.billingCycle === 'yearly') return start.getMonth() === mon - 1
          return true
        })
        .map((s) => ({ id: s.id, source: 'subscription', category: 'subscription', description: s.name, amount: getCostPerPerson(s), date: `${monthKey}-01` }))

      const receiptItems: SpendItem[] = receipts
        .filter((r) => {
          if (!r.date) return false
          const d = new Date(r.date)
          if (d.getFullYear() !== year || d.getMonth() !== mon - 1) return false
          return r.participants.some((p) => p.trim().toLowerCase() === ME)
        })
        .map((r) => {
          const share = calculateReceiptSplit(r).find((s) => s.name.trim().toLowerCase() === ME)
          return {
            id: r.id,
            source: 'receipt',
            category: r.category,
            description: r.title,
            amount: share?.total ?? 0,
            date: r.date,
          }
        })

      const manualItems: SpendItem[] = spendings
        .filter((s) => monthKeyOf(s.date) === monthKey)
        .map((s) => ({ id: s.id, source: 'manual', category: s.category, description: s.description, amount: s.amount, date: s.date, paymentMethod: s.paymentMethod, shopeeMethod: s.shopeeMethod }))

      return [...billItems, ...subItems, ...receiptItems, ...manualItems]
    }

  }, [bills, subscriptions, receipts, spendings, ME])

  const now = new Date()
  const todayStr = toDateKey(now)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const startOfWeekStr = toDateKey(startOfWeek)

  const recentItems = useMemo(() => {
    const monthsNeeded = new Set([monthKeyOf(todayStr), monthKeyOf(startOfWeekStr)])
    return Array.from(monthsNeeded).flatMap((mk) => buildItems(mk))
     
  }, [buildItems, todayStr, startOfWeekStr])

  const todayTotal = recentItems.filter((i) => i.date === todayStr).reduce((sum, i) => sum + i.amount, 0)
  const weekTotal = recentItems.filter((i) => i.date >= startOfWeekStr && i.date <= todayStr).reduce((sum, i) => sum + i.amount, 0)

  const items = useMemo(() => buildItems(month), [buildItems, month])
  const total = items.reduce((sum, i) => sum + i.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) || 0) + item.amount)
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [items])

  const topCategory = byCategory[0]?.category

  const dayGroups = useMemo(() => {
    const map = new Map<string, SpendItem[]>()
    for (const item of items) {
      const list = map.get(item.date) || []
      list.push(item)
      map.set(item.date, list)
    }
    return Array.from(map.entries())
      .map(([date, list]) => ({ date, list, total: list.reduce((sum, i) => sum + i.amount, 0) }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [items])

  return (
    <PageContainer>
      <Navbar title="Spending" action={<Button onClick={() => { setEditingSpending(null); setShowModal(true) }}><Plus size={15} /> Add Spending</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Every ringgit, tracked. Today, this week, this month.</p>

      <div ref={statsRef} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #f8717118 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #f8717125' }}>
          <p style={{ fontFamily: "'Syne', sans-serif", color: '#f87171' }} className="text-base md:text-xl font-extrabold leading-none mb-1 truncate">{formatCurrency(todayTotal)}</p>
          <p className="text-[#EEEEEE]/40 text-[10px] font-medium">Today</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #00ADB518 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #00ADB525' }}>
          <p style={{ fontFamily: "'Syne', sans-serif", color: '#00ADB5' }} className="text-base md:text-xl font-extrabold leading-none mb-1 truncate">{formatCurrency(weekTotal)}</p>
          <p className="text-[#EEEEEE]/40 text-[10px] font-medium">This week</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #8b5cf618 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #8b5cf625' }}>
          <p style={{ fontFamily: "'Syne', sans-serif", color: '#8b5cf6' }} className="text-base md:text-xl font-extrabold leading-none mb-1 truncate">{formatCurrency(total)}</p>
          <p className="text-[#EEEEEE]/40 text-[10px] font-medium">This month</p>
        </div>
      </div>

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

      {items.length === 0 ? (
        <EmptyState icon="💸" title="No spending yet" description="Add a spending or it'll fill in from bills, subs and receipts" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={{ background: `linear-gradient(145deg, ${colorFor(topCategory || 'other')}18 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${colorFor(topCategory || 'other')}25` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${colorFor(topCategory || 'other')}20` }}>
                <TrendingUp size={16} color={colorFor(topCategory || 'other')} />
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", color: colorFor(topCategory || 'other') }} className="text-lg font-extrabold leading-none mb-1 truncate capitalize">{topCategory || '-'}</p>
              <p className="text-[#EEEEEE]/40 text-xs font-medium">Top category</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(145deg, #00ADB518 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid #00ADB525' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#00ADB520' }}>
                <Wallet size={16} color="#00ADB5" />
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", color: '#00ADB5' }} className="text-lg font-extrabold leading-none mb-1">{items.length}</p>
              <p className="text-[#EEEEEE]/40 text-xs font-medium">Transactions</p>
            </div>
          </div>

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

          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-[#EEEEEE]/30" />
            <p className="text-[#EEEEEE]/40 text-[10px] font-semibold uppercase tracking-widest">Statement</p>
          </div>
          <div className="space-y-4">
            {dayGroups.map((group) => (
              <div key={group.date} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <p className="text-[#EEEEEE]/60 text-xs font-semibold">{formatDate(group.date)}</p>
                  <p className="text-[#EEEEEE]/60 text-xs font-bold">{formatCurrency(group.total)}</p>
                </div>
                {group.list.map((item) => {
                  const color = colorFor(item.category)
                  return (
                    <div key={item.source + item.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                      <div className="w-1 h-9 rounded-full shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#EEEEEE] text-sm font-medium truncate">{item.description}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ background: `${color}18`, color }}>{item.category}</span>
                          {paymentLabel(item.paymentMethod, item.shopeeMethod) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white/5 text-[#EEEEEE]/40">{paymentLabel(item.paymentMethod, item.shopeeMethod)}</span>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-sm shrink-0 text-red-400">{formatCurrency(item.amount)}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.source === 'manual' && (
                          <>
                            <button
                              onClick={() => {
                                const original = spendings.find((s) => s.id === item.id)
                                if (original) { setEditingSpending(original); setShowModal(true) }
                              }}
                              className="text-[#EEEEEE]/25 hover:text-[#00ADB5] transition-colors cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteSpending(item.id)} className="text-[#EEEEEE]/25 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {item.source === 'bill' && (
                          <>
                            <button
                              onClick={() => {
                                const original = bills.find((b) => b.id === item.id)
                                if (original) setEditingBill(original)
                              }}
                              className="text-[#EEEEEE]/25 hover:text-[#00ADB5] transition-colors cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteBill(item.id)} className="text-[#EEEEEE]/25 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {item.source === 'subscription' && (
                          <>
                            <button
                              onClick={() => {
                                const original = subscriptions.find((s) => s.id === item.id)
                                if (original) setEditingSubscription(original)
                              }}
                              className="text-[#EEEEEE]/25 hover:text-[#00ADB5] transition-colors cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => deleteSubscription(item.id)} className="text-[#EEEEEE]/25 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {item.source === 'receipt' && (
                          <>
                            <button onClick={() => navigate('/receipt')} className="text-[#EEEEEE]/25 hover:text-[#00ADB5] transition-colors cursor-pointer">
                              <ExternalLink size={14} />
                            </button>
                            <button onClick={() => deleteReceipt(item.id)} className="text-[#EEEEEE]/25 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingSpending(null) }}
        title={editingSpending ? 'Edit Spending' : 'Add Spending'}
      >
        <SpendingForm
          initial={editingSpending ?? undefined}
          onSubmit={(data) => {
            if (editingSpending) updateSpending(editingSpending.id, data)
            else addSpending(data)
            setShowModal(false)
            setEditingSpending(null)
          }}
          onCancel={() => { setShowModal(false); setEditingSpending(null) }}
        />
      </Modal>

      <Modal isOpen={editingBill !== null} onClose={() => setEditingBill(null)} title="Edit Bill">
        {editingBill && (
          <BillForm
            initial={editingBill}
            onSubmit={(data) => { updateBill(editingBill.id, data); setEditingBill(null) }}
            onCancel={() => setEditingBill(null)}
          />
        )}
      </Modal>

      <Modal isOpen={editingSubscription !== null} onClose={() => setEditingSubscription(null)} title="Edit Subscription">
        {editingSubscription && (
          <SubscriptionForm
            initial={editingSubscription}
            onSubmit={(data) => { updateSubscription(editingSubscription.id, data); setEditingSubscription(null) }}
            onCancel={() => setEditingSubscription(null)}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
