import { CheckCircle, Trash2, RefreshCw } from 'lucide-react'
import { type Bill } from '../../types/bill'
import { Button } from '../../components/layout/button'
import { EmptyState } from '../../components/layout/emptyState'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import confetti from 'canvas-confetti'

const categoryColors: Record<string, string> = {
  rent: '#8b5cf6',
  internet: '#00ADB5',
  utilities: '#f59e0b',
  mobile: '#ec4899',
  other: '#6b7280',
}

interface BillTableProps {
  bills: Bill[]
  onPay: (id: string) => void
  onDelete: (id: string) => void
}

export function BillTable({ bills, onPay, onDelete }: BillTableProps) {
  if (bills.length === 0) {
    return <EmptyState icon="🧾" title="No bills here" description="Track your recurring expenses" />
  }

  const handlePay = (id: string) => {
    onPay(id)
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ['#00ADB5', '#EEEEEE'] })
  }

  return (
    <div>
      {bills.map((bill) => {
        const color = categoryColors[bill.category] || '#6b7280'
        const isPaid = bill.status === 'paid'
        return (
          <div key={bill.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
            {/* accent bar */}
            <div className="w-1 h-10 rounded-full shrink-0" style={{ background: isPaid ? '#6b7280' : color }} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`font-semibold text-sm truncate ${isPaid ? 'text-[#EEEEEE]/40' : 'text-[#EEEEEE]'}`}>{bill.name}</p>
                {bill.recurring && <RefreshCw size={10} className="text-[#00ADB5] shrink-0" />}
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: isPaid ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)', color: isPaid ? '#4ade80' : '#f59e0b' }}
                >
                  {bill.status}
                </span>
              </div>
              <p className="text-[#EEEEEE]/30 text-xs">{bill.category} · Due {formatDate(bill.dueDate)}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <p className={`font-bold text-sm ${isPaid ? 'text-[#EEEEEE]/25' : 'text-red-400'}`}>{formatCurrency(bill.amount)}</p>
              <div className="flex gap-1">
                {!isPaid && (
                  <Button size="sm" variant="secondary" onClick={() => handlePay(bill.id)}>
                    <CheckCircle size={13} />
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => onDelete(bill.id)}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
