import { type Loan } from '../../types/loan'
import { type Bill } from '../../types/bill'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface ActivityCardProps {
  loans: Loan[]
  bills: Bill[]
}

export function ActivityCard({ loans, bills }: ActivityCardProps) {
  const recentLoans = loans.slice(0, 3)
  const recentBills = bills.filter((b) => b.status === 'pending').slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Recent Loans */}
      <div className="bg-[#393E46]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
        <p className="text-[#EEEEEE]/40 text-[11px] font-semibold uppercase tracking-widest mb-4">Recent Loans</p>
        {recentLoans.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-3xl mb-2">😎</p>
            <p className="text-[#EEEEEE]/40 text-sm">No debt yet, nice life</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(34,40,49,0.5)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ background: loan.type === 'lent' ? '#4ade80' : '#f87171' }}
                  />
                  <div>
                    <p className="text-[#EEEEEE] text-sm font-medium leading-none mb-0.5">{loan.person}</p>
                    <p className="text-[#EEEEEE]/30 text-xs">{formatDate(loan.date)}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${loan.type === 'lent' ? 'text-green-400' : 'text-red-400'}`}>
                  {loan.type === 'lent' ? '+' : '-'}{formatCurrency(loan.amount)}
                </p>
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
          <div className="space-y-2">
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
