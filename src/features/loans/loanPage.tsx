import { useState } from 'react'
import { Plus, HandCoins, TrendingUp, TrendingDown } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { Tabs } from '../../components/layout/tabs'
import { LoanForm } from './loanForm'
import { LoanTable } from './loanTable'
import { useLoans } from '../../hooks/useLoans'
import { formatCurrency } from '../../utils/formatCurrency'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'lent', label: 'Lent' },
  { id: 'borrowed', label: 'Borrowed' },
  { id: 'settled', label: 'Settled' },
]

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${color}18 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${color}25` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", color }} className="text-lg md:text-2xl font-extrabold leading-none mb-1 truncate">{value}</p>
      <p className="text-[#EEEEEE]/40 text-xs font-medium">{label}</p>
    </div>
  )
}

export function LoanPage() {
  const { loans, addLoan, updateStatus, deleteLoan, totalOwed, totalOwing } = useLoans()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const filtered = loans.filter((l) => {
    if (activeTab === 'lent') return l.type === 'lent' && l.status === 'pending'
    if (activeTab === 'borrowed') return l.type === 'borrowed' && l.status === 'pending'
    if (activeTab === 'settled') return l.status === 'settled'
    return true
  })

  return (
    <PageContainer>
      <Navbar title="Loan Tracker" action={<Button onClick={() => setShowModal(true)}><Plus size={15} /> Add Loan</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Track what you lent and borrowed.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="You are owed" value={formatCurrency(totalOwed)} color="#4ade80" icon={<TrendingUp size={16} />} />
        <StatCard label="You owe" value={formatCurrency(totalOwing)} color="#f87171" icon={<TrendingDown size={16} />} />
        <StatCard label="Total loans" value={String(loans.length)} color="#00ADB5" icon={<HandCoins size={16} />} />
      </div>

      <div className="mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
        <LoanTable loans={filtered} onSettle={(id) => updateStatus(id, 'settled')} onDelete={deleteLoan} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Loan">
        <LoanForm onSubmit={(data) => { addLoan(data); setShowModal(false) }} onCancel={() => setShowModal(false)} />
      </Modal>
    </PageContainer>
  )
}
