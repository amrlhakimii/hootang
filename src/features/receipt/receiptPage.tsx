import { useState } from 'react'
import { Plus, Trash2, UtensilsCrossed, Users } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { EmptyState } from '../../components/layout/emptyState'
import { ReceiptForm } from './receiptForm'
import { useReceipts } from '../../hooks/useReceipt'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export function ReceiptPage() {
  const { receipts, addReceipt, deleteReceipt } = useReceipts()
  const [showModal, setShowModal] = useState(false)

  return (
    <PageContainer>
      <Navbar title="Receipt Splitter" action={<Button onClick={() => setShowModal(true)}><Plus size={15} /> New Receipt</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Split meals, trips, and hangouts fairly.</p>

      {receipts.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed size={28} />} title="No receipts yet" description="Split your next meal with friends — no awkward math" />
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => {
            const subtotal = receipt.items.reduce((sum, i) => sum + i.price, 0)
            const total = subtotal * (1 + receipt.tax / 100 + receipt.serviceCharge / 100)
            const perPerson = receipt.participants.length > 0 ? total / receipt.participants.length : 0
            return (
              <div
                key={receipt.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(57,62,70,0.55)', border: '1px solid rgba(238,238,238,0.06)' }}
              >
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ec4899, transparent)' }} />
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#EEEEEE] font-semibold text-sm truncate">{receipt.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#ec4899]/15 text-[#ec4899] shrink-0">{receipt.splitMode}</span>
                    </div>
                    <p className="text-[#EEEEEE]/30 text-xs mb-2">{formatDate(receipt.date)} · {receipt.items.length} items</p>
                    <div className="flex flex-wrap gap-1">
                      {receipt.participants.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-[#EEEEEE]/50">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div>
                      <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[#00ADB5] font-extrabold text-lg leading-none">{formatCurrency(total)}</p>
                      <p className="text-[#EEEEEE]/30 text-[10px] mt-0.5 flex items-center gap-1 justify-end">
                        <Users size={9} /> {formatCurrency(perPerson)} each
                      </p>
                    </div>
                    <Button size="sm" variant="danger" onClick={() => deleteReceipt(receipt.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Split Receipt">
        <ReceiptForm onSave={(data) => { addReceipt(data); setShowModal(false) }} onCancel={() => setShowModal(false)} />
      </Modal>
    </PageContainer>
  )
}
