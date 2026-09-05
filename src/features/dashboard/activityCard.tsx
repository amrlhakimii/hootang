import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { type Spending } from '../../types/spending'
import { type Bill } from '../../types/bill'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface ActivityCardProps {
  spendings: Spending[]
  bills: Bill[]
}

const categoryColors: Record<string, string> = {
  food: '#fb923c',
  groceries: '#4ade80',
  transport: '#38bdf8',
  shopping: '#facc15',
  entertainment: '#f472b6',
  health: '#f87171',
  bills: '#f59e0b',
  other: '#6b7280',
}

export function ActivityCard({ spendings, bills }: ActivityCardProps) {
  const recentSpendings = [...spendings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
  const recentBills = bills.filter((b) => b.status === 'pending').slice(0, 3)
  const spendingsListRef = useRef<HTMLDivElement>(null)
  const billsListRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    const spendingRows = spendingsListRef.current ? Array.from(spendingsListRef.current.children) : []
    const billRows = billsListRef.current ? Array.from(billsListRef.current.children) : []
    if (!spendingRows.length && !billRows.length) return
    hasAnimated.current = true
    if (spendingRows.length) {
      gsap.fromTo(spendingRows,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out', stagger: 0.08, delay: 0.25 }
      )
    }
    if (billRows.length) {
      gsap.fromTo(billRows,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out', stagger: 0.08, delay: 0.35 }
      )
    }
  }, [recentSpendings.length, recentBills.length])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Spendings */}
      <div className="bg-[#393E46]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
        <p className="text-[#EEEEEE]/40 text-[11px] font-semibold uppercase tracking-widest mb-4">Recent Spendings</p>
        {recentSpendings.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-3xl mb-2">😎</p>
            <p className="text-[#EEEEEE]/40 text-sm">No spending yet, nice life</p>
          </div>
        ) : (
          <div ref={spendingsListRef} className="space-y-2">
            {recentSpendings.map((spending) => (
              <div
                key={spending.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,40,49,0.5)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ background: categoryColors[spending.category] || '#6b7280' }}
                  />
                  <div className="min-w-0">
                    <p className="text-[#EEEEEE] text-sm font-medium leading-none mb-0.5 truncate">{spending.description}</p>
                    <p className="text-[#EEEEEE]/30 text-xs">{formatDate(spending.date)}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-red-400 shrink-0 ml-2">-{formatCurrency(spending.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Bills */}
      <div className="bg-[#393E46]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
        <p className="text-[#EEEEEE]/40 text-[11px] font-semibold uppercase tracking-widest mb-4">Pending Bills</p>
        {recentBills.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-[#EEEEEE]/40 text-sm">All bills paid, hero move</p>
          </div>
        ) : (
          <div ref={billsListRef} className="space-y-2">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,40,49,0.5)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-8 rounded-full shrink-0 bg-yellow-400" />
                  <div>
                    <p className="text-[#EEEEEE] text-sm font-medium leading-none mb-0.5">{bill.name}</p>
                    <p className="text-[#EEEEEE]/30 text-xs">Due {formatDate(bill.dueDate)}</p>
                  </div>
                </div>
                <p className="text-yellow-400 text-sm font-bold">{formatCurrency(bill.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
