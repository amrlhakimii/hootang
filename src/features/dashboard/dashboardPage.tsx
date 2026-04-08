import { useNavigate } from 'react-router-dom'
import { HandCoins, Receipt, Tv, UtensilsCrossed } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { BalanceCard } from './balanceCard'
import { ActivityCard } from './activityCard'
import { useLoans } from '../../hooks/useLoans'
import { useBills } from '../../hooks/useBills'
import { useSubscriptions } from '../../hooks/useSubscription'
import { useReceipts } from '../../hooks/useReceipt'
import { formatCurrency } from '../../utils/formatCurrency'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Still up? 🌙'
  if (h < 12) return 'Morning 👋'
  if (h < 18) return 'Afternoon ☀️'
  return 'Evening 🌆'
}

function getDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getStatusLine(net: number, pendingCount: number): string {
  if (pendingCount > 2) return `${pendingCount} bills waiting. Don't ghost them. 👀`
  if (net > 200) return `You're owed ${formatCurrency(net)}. Go collect. 💰`
  if (net > 0) return `You're in the green. Don't get comfortable. 😏`
  if (net < -200) return `You owe ${formatCurrency(Math.abs(net))}. Settle up soon. 😬`
  if (net < 0) return `Slight deficit. You'll be fine. 🤙`
  return `You're perfectly even. Clean slate energy. ✨`
}

const quickActions = [
  { label: 'Add Loan', emoji: '🤝', path: '/loans', color: '#00ADB5' },
  { label: 'Add Bill', emoji: '📄', path: '/bills', color: '#f59e0b' },
  { label: 'Split Receipt', emoji: '🧾', path: '/receipts', color: '#ec4899' },
  { label: 'Roll Dice', emoji: '🎲', path: '/dice', color: '#8b5cf6' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { loans, totalOwed, totalOwing } = useLoans()
  const { bills, pendingBills } = useBills()
  const { subscriptions } = useSubscriptions()
  const { receipts } = useReceipts()

  const net = totalOwed - totalOwing
  const activeLoans = loans.filter((l) => l.status === 'pending').length

  return (
    <PageContainer>
      {/* Personal greeting */}
      <div className="mb-5">
        <p className="text-[#EEEEEE]/30 text-xs font-semibold uppercase tracking-widest mb-1.5">{getDate()}</p>
        <h1
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-2xl md:text-3xl font-extrabold text-[#EEEEEE] leading-tight mb-1.5"
        >
          {getGreeting()}
        </h1>
        <p className="text-[#EEEEEE]/50 text-sm">{getStatusLine(net, pendingBills.length)}</p>
      </div>

      {/* Hero balance card */}
      <div className="mb-5">
        <BalanceCard owed={totalOwed} owing={totalOwing} />
      </div>

      {/* Quick actions */}
      <div className="mb-5">
        <p className="text-[#EEEEEE]/30 text-[10px] font-semibold uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95 cursor-pointer"
              style={{
                background: `${action.color}10`,
                border: `1px solid ${action.color}22`,
              }}
            >
              <span className="text-2xl leading-none">{action.emoji}</span>
              <span
                className="text-[10px] font-semibold leading-tight text-center px-1"
                style={{ color: `${action.color}cc` }}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stat chips row */}
      <div className="flex gap-2 overflow-x-auto mb-5" style={{ scrollbarWidth: 'none' }}>
        {[
          { icon: <HandCoins size={14} />, label: 'Active Loans', value: activeLoans, color: '#00ADB5' },
          { icon: <Receipt size={14} />, label: 'Pending Bills', value: pendingBills.length, color: '#f59e0b' },
          { icon: <Tv size={14} />, label: 'Subscriptions', value: subscriptions.length, color: '#8b5cf6' },
          { icon: <UtensilsCrossed size={14} />, label: 'Splits', value: receipts.length, color: '#ec4899' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full shrink-0"
            style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}22` }}
          >
            <span style={{ color: stat.color }}>{stat.icon}</span>
            <span
              style={{ fontFamily: "'Syne', sans-serif", color: stat.color }}
              className="text-base font-extrabold leading-none"
            >
              {stat.value}
            </span>
            <span className="text-[#EEEEEE]/35 text-xs font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <ActivityCard loans={loans} bills={bills} />
    </PageContainer>
  )
}
