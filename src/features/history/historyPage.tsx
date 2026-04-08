import { useState } from 'react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Tabs } from '../../components/layout/tabs'
import { TransactionList } from './transactionList'
import { useLoans } from '../../hooks/useLoans'
import { useBills } from '../../hooks/useBills'
import { useSubscriptions } from '../../hooks/useSubscription'
import { useReceipts } from '../../hooks/useReceipt'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'loan', label: 'Loans' },
  { id: 'bill', label: 'Bills' },
  { id: 'subscription', label: 'Subs' },
  { id: 'receipt', label: 'Receipts' },
]

const categoryColors: Record<string, string> = {
  loan: '#00ADB5',
  bill: '#f59e0b',
  subscription: '#8b5cf6',
  receipt: '#ec4899',
}

export function HistoryPage() {
  const { loans } = useLoans()
  const { bills } = useBills()
  const { subscriptions } = useSubscriptions()
  const { receipts } = useReceipts()
  const [activeTab, setActiveTab] = useState('all')

  const counts = { loan: loans.length, bill: bills.length, subscription: subscriptions.length, receipt: receipts.length }

  return (
    <PageContainer>
      <Navbar title="History" />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Everything you've tracked, all in one place.</p>

      {/* Category stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(['loan', 'bill', 'subscription', 'receipt'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="rounded-2xl p-3 text-left transition-all cursor-pointer"
            style={{
              background: activeTab === cat
                ? `linear-gradient(145deg, ${categoryColors[cat]}25 0%, rgba(57,62,70,0.7) 100%)`
                : 'rgba(57,62,70,0.35)',
              border: `1px solid ${activeTab === cat ? categoryColors[cat] + '40' : 'rgba(238,238,238,0.05)'}`,
            }}
          >
            <p style={{ fontFamily: "'Syne', sans-serif", color: categoryColors[cat] }} className="text-xl font-extrabold leading-none mb-1">{counts[cat]}</p>
            <p className="text-[#EEEEEE]/35 text-[10px] capitalize">{cat}s</p>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
        <TransactionList loans={loans} bills={bills} subscriptions={subscriptions} receipts={receipts} filter={activeTab} />
      </div>
    </PageContainer>
  )
}
