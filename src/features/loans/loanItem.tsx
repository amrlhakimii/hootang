import { CheckCircle, Trash2, Clock } from 'lucide-react'
import { type Loan } from '../../types/loan'
import { Button } from '../../components/layout/button'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import confetti from 'canvas-confetti'

interface LoanItemProps {
  loan: Loan
  onSettle: (id: string) => void
  onDelete: (id: string) => void
}

export function LoanItem({ loan, onSettle, onDelete }: LoanItemProps) {
  const isLent = loan.type === 'lent'
  const accentColor = loan.status === 'settled' ? '#6b7280' : isLent ? '#4ade80' : '#f87171'

  const handleSettle = () => {
    onSettle(loan.id)
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#00ADB5', '#EEEEEE'] })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
      {/* accent bar */}
      <div className="w-1 h-10 rounded-full shrink-0" style={{ background: accentColor }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[#EEEEEE] font-semibold text-sm truncate">{loan.person}</p>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${accentColor}20`, color: accentColor }}>
            {isLent ? 'lent' : 'borrowed'}
          </span>
          {loan.status === 'settled' && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/8 text-white/30">settled</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#EEEEEE]/30">
          <span>{formatDate(loan.date)}</span>
          {loan.dueDate && <span className="flex items-center gap-1"><Clock size={9} /> Due {formatDate(loan.dueDate)}</span>}
          {loan.notes && <span className="truncate max-w-32 italic">"{loan.notes}"</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        <p className="font-bold text-sm" style={{ color: accentColor }}>
          {isLent ? '+' : '-'}{formatCurrency(loan.amount)}
        </p>
        <div className="flex gap-1">
          {loan.status === 'pending' && (
            <Button size="sm" variant="secondary" onClick={handleSettle} title="Mark settled">
              <CheckCircle size={13} />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => onDelete(loan.id)}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}
