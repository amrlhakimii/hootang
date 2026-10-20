import { CheckCircle, Circle, Trash2, RefreshCw, Pencil } from 'lucide-react'
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
  onUnpay: (id: string) => void
  onEdit: (bill: Bill) => void
  onDelete: (id: string) => void
}

export function BillTable({ bills, onPay, onUnpay, onEdit, onDelete }: BillTableProps) {
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
          <div key={bill.id} className="flex gap-3 px-4 py-3 border-b border-white/5 last:border-0">
            {/* accent bar */}
            <div className="w-1 min-h-10 self-stretch rounded-full shrink-0" style={{ background: isPaid ? '#6b7280' : color }} />

            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-0.5">
                <p className={`font-semibold text-sm truncate max-w-full ${isPaid ? 'text-[#EEEEEE]/40' : 'text-[#EEEEEE]'}`}>{bill.name}</p>
                {bill.recurring && <RefreshCw size={12} className="text-[#00ADB5] shrink-0" />}
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: isPaid ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)', color: isPaid ? '#4ade80' : '#f59e0b' }}
                >
                  {bill.status}
                </span>
              </div>
              <p className="text-[#EEEEEE]/30 text-xs">{bill.category} · Due {formatDate(bill.dueDate)}</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:shrink-0">
              <p className={`font-bold text-sm ${isPaid ? 'text-[#EEEEEE]/25' : 'text-red-400'}`}>{formatCurrency(bill.amount)}</p>
              <div className="flex gap-1">
                {isPaid ? (
                  <Button size="sm" variant="secondary" onClick={() => onUnpay(bill.id)} aria-label="Mark pending" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
                    <Circle size={13} />
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => handlePay(bill.id)} aria-label="Mark paid" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
                    <CheckCircle size={13} />
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => onEdit(bill)} aria-label="Edit bill" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
                  <Pencil size={13} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(bill.id)} aria-label="Delete bill" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
