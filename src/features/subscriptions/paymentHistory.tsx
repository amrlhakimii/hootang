import { type Subscription } from '../../types/subscription'
import { formatMonth, getCurrentMonth } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'
import { getCostPerPerson } from '../../utils/calculateSubscription'
import confetti from 'canvas-confetti'

interface PaymentHistoryProps {
  subscription: Subscription
  onToggle: (subId: string, name: string, month: string) => void
}

function getLast6Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export function PaymentHistory({ subscription, onToggle }: PaymentHistoryProps) {
  const months = getLast6Months()
  const perPerson = getCostPerPerson(subscription)
  const currentMonth = getCurrentMonth()

  const isPaid = (participantName: string, month: string) => {
    const p = subscription.participants.find((p) => p.name === participantName)
    return p?.payments.find((pay) => pay.month === month)?.paid ?? false
  }

  const handleToggle = (name: string, month: string) => {
    const wasPaid = isPaid(name, month)
    onToggle(subscription.id, name, month)
    if (!wasPaid) {
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 }, colors: ['#00ADB5', '#EEEEEE'] })
    }
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-[#EEEEEE]/40 pb-2 pr-4 font-normal">Person</th>
            {months.map((m) => (
              <th key={m} className={`text-center pb-2 px-1 font-normal ${m === currentMonth ? 'text-[#00ADB5]' : 'text-[#EEEEEE]/40'}`}>
                {formatMonth(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subscription.participants.map((p) => (
            <tr key={p.name}>
              <td className="text-[#EEEEEE]/70 pr-4 py-1.5 whitespace-nowrap">{p.name}</td>
              {months.map((month) => {
                const paid = isPaid(p.name, month)
                return (
                  <td key={month} className="text-center px-1">
                    <button
                      onClick={() => handleToggle(p.name, month)}
                      className={`w-6 h-6 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                        paid
                          ? 'bg-[#00ADB5] text-[#222831]'
                          : 'bg-[#222831] text-[#EEEEEE]/30 hover:bg-[#393E46]'
                      }`}
                      title={`${p.name} - ${formatMonth(month)}: ${paid ? 'Paid' : 'Not paid'}`}
                    >
                      {paid ? '✓' : '·'}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[#EEEEEE]/30 text-xs mt-2">
        Each pays: <span className="text-[#00ADB5] font-semibold">{formatCurrency(perPerson)}</span>
        {subscription.billingCycle === 'yearly' ? '/yr' : '/mo'}
      </p>
    </div>
  )
}
