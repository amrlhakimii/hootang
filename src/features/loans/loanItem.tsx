import { CheckCircle, Trash2, Clock, Share2 } from 'lucide-react'
import { type Loan } from '../../types/loan'
import { Button } from '../../components/layout/button'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { shareWhatsApp } from '../../utils/shareWhatsApp'
import confetti from 'canvas-confetti'

interface LoanItemProps {
  loan: Loan
  onSettle: (id: string) => void
  onDelete: (id: string) => void
}

export function LoanItem({ loan, onSettle, onDelete }: LoanItemProps) {
  const isLent = loan.type === 'lent'
  const accentColor = loan.status === 'settled' ? '#6b7280' : isLent ? '#4ade80' : '#f87171'

  const handleShare = () => {
    const lines = loan.type === 'lent'
      ? [
          `Hey ${loan.person}! 👋`,
          `Just a reminder — you owe me *${formatCurrency(loan.amount)}*${loan.notes ? ` for "${loan.notes}"` : ''}.`,
          loan.dueDate ? `Due by ${formatDate(loan.dueDate)}.` : '',
          '',
          '_Tracked via hootang_',
        ]
      : [
          `Hey! 👋`,
          `Reminder that I owe *${loan.person}* *${formatCurrency(loan.amount)}*${loan.notes ? ` for "${loan.notes}"` : ''}.`,
          loan.dueDate ? `Due by ${formatDate(loan.dueDate)}.` : '',
          '',
          '_Tracked via hootang_',
        ]
    shareWhatsApp(lines.filter(Boolean).join('\n'))
  }

  const handleSettle = () => {
    onSettle(loan.id)
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#00ADB5', '#EEEEEE'] })
  }

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-white/5 last:border-0">
      {/* accent bar */}
      <div className="w-1 min-h-10 self-stretch rounded-full shrink-0" style={{ background: accentColor }} />

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-0.5">
          <p className="text-[#EEEEEE] font-semibold text-sm truncate max-w-full">{loan.person}</p>
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${accentColor}20`, color: accentColor }}>
            {isLent ? 'lent' : 'borrowed'}
          </span>
          {loan.status === 'settled' && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/8 text-white/30">settled</span>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#EEEEEE]/30">
          <span>{formatDate(loan.date)}</span>
          {loan.dueDate && <span className="flex items-center gap-1"><Clock size={12} /> Due {formatDate(loan.dueDate)}</span>}
          {loan.notes && <span className="truncate max-w-full sm:max-w-32 italic">"{loan.notes}"</span>}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:shrink-0">
        <p className="font-bold text-sm" style={{ color: accentColor }}>
          {isLent ? '+' : '-'}{formatCurrency(loan.amount)}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={handleShare} title="Share on WhatsApp" aria-label="Share on WhatsApp" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
            <Share2 size={13} />
          </Button>
          {loan.status === 'pending' && (
            <Button size="sm" variant="secondary" onClick={handleSettle} title="Mark settled" aria-label="Mark settled" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
              <CheckCircle size={13} />
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => onDelete(loan.id)} aria-label="Delete loan" className="min-h-11 min-w-11 justify-center sm:min-h-0 sm:min-w-0">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
