import { HandCoins, Receipt, Tv, UtensilsCrossed } from 'lucide-react'
import { type Loan } from '../../types/loan'
import { type Bill } from '../../types/bill'
import { type Subscription } from '../../types/subscription'
import { type Receipt as ReceiptType } from '../../types/receipt'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { EmptyState } from '../../components/layout/emptyState'

interface TransactionListProps {
  loans: Loan[]
  bills: Bill[]
  subscriptions: Subscription[]
  receipts: ReceiptType[]
  filter: string
}

type Item = { id: string; category: string; description: string; amount: number; date: string; meta: string }

const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  loan:         { icon: <HandCoins size={14} />,     color: '#00ADB5' },
  bill:         { icon: <Receipt size={14} />,        color: '#f59e0b' },
  subscription: { icon: <Tv size={14} />,             color: '#8b5cf6' },
  receipt:      { icon: <UtensilsCrossed size={14} />,color: '#ec4899' },
}

export function TransactionList({ loans, bills, subscriptions, receipts, filter }: TransactionListProps) {
  const items: Item[] = [
    ...loans.map((l) => ({ id: l.id, category: 'loan', description: `${l.type === 'lent' ? 'Lent to' : 'Borrowed from'} ${l.person}`, amount: l.type === 'lent' ? l.amount : -l.amount, date: l.date, meta: l.status })),
    ...bills.map((b) => ({ id: b.id, category: 'bill', description: b.name, amount: -b.amount, date: b.dueDate, meta: b.status })),
    ...subscriptions.map((s) => ({ id: s.id, category: 'subscription', description: s.name, amount: -s.totalAmount, date: s.startDate, meta: `${s.participants.length} people` })),
    ...receipts.map((r) => ({ id: r.id, category: 'receipt', description: r.title, amount: -(r.items.reduce((sum, i) => sum + i.price, 0) * (1 + r.tax / 100 + r.serviceCharge / 100)), date: r.date, meta: `${r.participants.length} people` })),
  ]
    .filter((item) => filter === 'all' || item.category === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (items.length === 0) {
    return <EmptyState icon="📭" title="Nothing here yet" description="Your transactions will show up here" />
  }

  return (
    <div>
      {items.map((item) => {
        const { icon, color } = categoryMeta[item.category]
        return (
          <div key={item.id + item.category} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
            {/* category dot */}
            <div className="w-1 h-10 rounded-full shrink-0" style={{ background: color }} />

            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18` }}
            >
              <span style={{ color }}>{icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[#EEEEEE] text-sm font-medium truncate">{item.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[#EEEEEE]/30 text-xs">{formatDate(item.date)}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${color}18`, color }}>{item.category}</span>
                <span className="text-[#EEEEEE]/20 text-xs">{item.meta}</span>
              </div>
            </div>

            <p className={`font-bold text-sm shrink-0 ${item.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(item.amount))}
            </p>
          </div>
        )
      })}
    </div>
  )
}
