import { useState } from 'react'
import { Plus, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { Tabs } from '../../components/layout/tabs'
import { BillForm } from './billForm'
import { BillTable } from './billTable'
import { useBills } from '../../hooks/useBills'
import { formatCurrency } from '../../utils/formatCurrency'

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
]

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 overflow-hidden" style={{ background: `linear-gradient(145deg, ${color}18 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${color}25` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", color }} className="text-lg md:text-2xl font-extrabold leading-none mb-1 truncate">{value}</p>
      <p className="text-[#EEEEEE]/40 text-xs font-medium">{label}</p>
    </div>
  )
}

export function BillPage() {
  const { bills, addBill, updateStatus, deleteBill, pendingBills } = useBills()
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const filtered = bills.filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending'
    if (activeTab === 'paid') return b.status === 'paid'
    return true
  })

  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0)
  const paidCount = bills.filter((b) => b.status === 'paid').length

  return (
    <PageContainer>
      <Navbar title="Bill Tracker" action={<Button onClick={() => setShowModal(true)}><Plus size={15} /> Add Bill</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Stay on top of what's due.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Pending" value={String(pendingBills.length)} color="#f59e0b" icon={<AlertCircle size={16} />} />
        <StatCard label="Amount due" value={formatCurrency(totalPending)} color="#f87171" icon={<Receipt size={16} />} />
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Paid" value={String(paidCount)} color="#4ade80" icon={<CheckCircle2 size={16} />} />
        </div>
      </div>

      <div className="mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(57,62,70,0.5)', border: '1px solid rgba(238,238,238,0.05)' }}>
        <BillTable bills={filtered} onPay={(id) => updateStatus(id, 'paid')} onDelete={deleteBill} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Bill">
        <BillForm onSubmit={(data) => { addBill(data); setShowModal(false) }} onCancel={() => setShowModal(false)} />
      </Modal>
    </PageContainer>
  )
}
