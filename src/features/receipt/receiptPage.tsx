import { useState } from 'react'
import { Check, FileDown, Layers, Plus, Trash2, UtensilsCrossed, Users, X } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { EmptyState } from '../../components/layout/emptyState'
import { ReceiptForm } from './receiptForm'
import { ReceiptDetail } from './receiptDetail'
import { useReceipts } from '../../hooks/useReceipt'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { generateCombinedReceiptPDF } from '../../utils/generateCombinedReceiptPDF'
import { type Receipt } from '../../types/receipt'

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍜', transport: '🚗', accommodation: '🏨',
  entertainment: '🎬', shopping: '🛍️', utilities: '⚡', other: '📦',
}

export function ReceiptPage() {
  const { receipts, addReceipt, updateReceipt, deleteReceipt } = useReceipts()
  const [showModal, setShowModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleUpdate = (updated: Receipt) => {
    updateReceipt(updated)
    setSelectedReceipt(updated)
  }

  const handleEditSave = (data: Omit<Receipt, 'id'>) => {
    if (!selectedReceipt) return
    const updated = { ...data, id: selectedReceipt.id }
    updateReceipt(updated)
    setSelectedReceipt(updated)
    setIsEditing(false)
  }

  const handleCloseDetail = () => {
    setSelectedReceipt(null)
    setIsEditing(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const handleCombinedExport = () => {
    const selected = receipts.filter((r) => selectedIds.has(r.id))
    generateCombinedReceiptPDF(selected)
    exitSelectMode()
  }

  const navAction = selectMode ? (
    <Button variant="ghost" onClick={exitSelectMode}>
      <X size={14} /> Cancel
    </Button>
  ) : (
    <div className="flex gap-2">
      {receipts.length >= 2 && (
        <Button variant="secondary" onClick={() => setSelectMode(true)}>
          <Layers size={14} /> Combine
        </Button>
      )}
      <Button onClick={() => setShowModal(true)}>
        <Plus size={15} /> New Receipt
      </Button>
    </div>
  )

  return (
    <PageContainer>
      <Navbar title="Receipt Splitter" action={navAction} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">
        {selectMode ? 'Select receipts to combine into one PDF.' : 'Split meals, trips, and hangouts fairly.'}
      </p>

      {receipts.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed size={28} />} title="No receipts yet" description="Split your next meal with friends — no awkward math" />
      ) : (
        <div className="space-y-3 pb-24">
          {receipts.map((receipt) => {
            const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
            const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
            const subtotal = rawSubtotal - discountAmt
            const total = subtotal * (1 + (receipt.tax ?? 0) / 100 + (receipt.serviceCharge ?? 0) / 100)
            const perPerson = receipt.participants.length > 0 ? total / receipt.participants.length : 0
            const icon = CATEGORY_ICONS[receipt.category ?? 'other'] ?? '📦'
            const settledBy = receipt.settledBy ?? []
            const allSettled = settledBy.length > 0 && receipt.participants.every((p) => p === receipt.paidBy || settledBy.includes(p))
            const isSelected = selectedIds.has(receipt.id)

            return (
              <div
                key={receipt.id}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all"
                style={{
                  background: 'rgba(57,62,70,0.55)',
                  border: isSelected
                    ? '1.5px solid rgba(0,173,181,0.8)'
                    : '1px solid rgba(238,238,238,0.06)',
                  boxShadow: isSelected ? '0 0 0 3px rgba(0,173,181,0.12)' : 'none',
                }}
                onClick={() => {
                  if (selectMode) {
                    toggleSelect(receipt.id)
                  } else {
                    setSelectedReceipt(receipt)
                    setIsEditing(false)
                  }
                }}
              >
                <div className="h-1 w-full" style={{ background: allSettled ? 'linear-gradient(90deg, #10b981, transparent)' : 'linear-gradient(90deg, #ec4899, transparent)' }} />
                <div className="p-4 flex items-center justify-between gap-3">
                  {/* Selection circle */}
                  {selectMode && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-[#00ADB5] border-[#00ADB5]' : 'border-[#EEEEEE]/25'
                    }`}>
                      {isSelected && <Check size={10} className="text-[#222831]" />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{icon}</span>
                      <p className="text-[#EEEEEE] font-semibold text-sm truncate">{receipt.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#ec4899]/15 text-[#ec4899] shrink-0">{receipt.splitMode}</span>
                      {allSettled && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-500/15 text-green-400 shrink-0">settled</span>}
                    </div>
                    <p className="text-[#EEEEEE]/30 text-xs mb-2">{formatDate(receipt.date)} · {receipt.items.length} items</p>
                    <div className="flex flex-wrap gap-1">
                      {receipt.participants.map((p) => (
                        <span key={p} className={`text-[10px] px-2 py-0.5 rounded-full ${settledBy.includes(p) ? 'bg-green-500/10 text-green-400' : 'bg-white/6 text-[#EEEEEE]/50'}`}>{p}</span>
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
                    {!selectMode && (
                      <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); deleteReceipt(receipt.id) }}>
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Floating combine bar */}
      {selectMode && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
          <div
            className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
            style={{ background: '#222831', border: '1px solid rgba(238,238,238,0.1)' }}
          >
            {selectedIds.size === 0 ? (
              <span className="text-[#EEEEEE]/40 text-sm">Select receipts to combine</span>
            ) : (
              <>
                <span className="text-[#EEEEEE] text-sm font-medium">
                  {selectedIds.size} receipt{selectedIds.size !== 1 ? 's' : ''} selected
                </span>
                <Button onClick={handleCombinedExport}>
                  <FileDown size={14} /> Export Combined PDF
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Split Receipt">
        <ReceiptForm onSave={(data) => { addReceipt(data); setShowModal(false) }} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal
        isOpen={!!selectedReceipt}
        onClose={handleCloseDetail}
        title={isEditing ? `Edit — ${selectedReceipt?.title}` : (selectedReceipt?.title ?? '')}
      >
        {selectedReceipt && !isEditing && (
          <ReceiptDetail
            receipt={selectedReceipt}
            onUpdate={handleUpdate}
            onEdit={() => setIsEditing(true)}
          />
        )}
        {selectedReceipt && isEditing && (
          <ReceiptForm
            initialData={selectedReceipt}
            onSave={handleEditSave}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
