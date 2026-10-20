import { Check, FileDown, Loader2, Pencil, Share2 } from 'lucide-react'
import { useState } from 'react'
import { type Receipt } from '../../types/receipt'
import { calculateReceiptSplit } from '../../utils/calculateSplit'
import { formatCurrency } from '../../utils/formatCurrency'
import { generateReceiptPDF } from '../../utils/generateReceiptPDF'
import { generateReceiptPDFBlob } from '../../utils/generateReceiptPDFBlob'
import { shareWhatsApp } from '../../utils/shareWhatsApp'
import { getReceiptQr } from '../../utils/duitnow'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '../../components/layout/button'

interface ReceiptDetailProps {
  receipt: Receipt
  onUpdate: (receipt: Receipt) => void
  onEdit: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍜', transport: '🚗', accommodation: '🏨',
  entertainment: '🎬', shopping: '🛍️', utilities: '⚡', other: '📦',
}

export function ReceiptDetail({ receipt, onUpdate, onEdit }: ReceiptDetailProps) {
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt
  const settledBy = receipt.settledBy ?? []
  const [sharing, setSharing] = useState(false)
  const { profile } = useProfile()
  const qr = getReceiptQr(receipt, profile)

  const toggleSettle = (name: string) => {
    const newSettledBy = settledBy.includes(name)
      ? settledBy.filter((n) => n !== name)
      : [...settledBy, name]
    onUpdate({ ...receipt, settledBy: newSettledBy })
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const blob = await generateReceiptPDFBlob(receipt, { qrDataUrl: qr })
      const safeName = receipt.title.replace(/[^a-z0-9]/gi, '_')
      const file = new File([blob], `${safeName}.pdf`, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch {
      // fall through to text share
    } finally {
      setSharing(false)
    }
    const lines = [
      `🧾 *${receipt.title}*`,
      receipt.paidBy ? `Paid by: *${receipt.paidBy}*` : '',
      `Total: *${formatCurrency(grandTotal)}*`,
      '',
      `Here's the breakdown:`,
      ...shares.map((s) => `• ${s.name} — *${formatCurrency(s.total)}*${settledBy.includes(s.name) ? ' ✓' : ''}`),
      '',
      '_Shared via hootang_',
    ].filter(Boolean)
    shareWhatsApp(lines.join('\n'))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit} className="min-h-11">
          <Pencil size={14} /> Edit
        </Button>
        <Button variant="secondary" size="sm" onClick={handleShare} disabled={sharing} className="min-h-11">
          {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
          {sharing ? 'Generating…' : 'Share'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => generateReceiptPDF(receipt, { qrDataUrl: qr })} className="min-h-11">
          <FileDown size={14} /> PDF
        </Button>
      </div>

      {/* Meta badges */}
      {(receipt.paidBy || receipt.category) && (
        <div className="flex gap-2 flex-wrap">
          {receipt.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/6 text-[#EEEEEE]/50">
              {CATEGORY_ICONS[receipt.category]} {receipt.category}
            </span>
          )}
          {receipt.paidBy && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#00ADB5]/15 text-[#00ADB5]">
              💳 Paid by {receipt.paidBy}
            </span>
          )}
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Items</p>
        <div className="bg-[#222831] rounded-xl divide-y divide-[#393E46]">
          {receipt.items.map((item) => {
            const qty = item.quantity ?? 1
            const total = item.price * qty
            return (
              <div key={item.id} className="px-4 py-3">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 break-words">
                    <span className="text-[#EEEEEE] text-sm">{item.name}</span>
                    {qty > 1 && (
                      <span className="text-[#EEEEEE]/40 text-xs ml-2">{qty} × {formatCurrency(item.price)}</span>
                    )}
                  </div>
                  <span className="text-[#EEEEEE]/70 text-sm shrink-0">{formatCurrency(total)}</span>
                </div>
                {receipt.splitMode === 'itemized' && item.assignedTo.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.assignedTo.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-white/6 text-[#EEEEEE]/50">
                        {p}{item.customAmounts ? ` · ${formatCurrency(item.customAmounts[p] ?? 0)}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Summary</p>
        <div className="bg-[#222831] rounded-xl p-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#EEEEEE]/50">
            <span>Subtotal</span>
            <span>{formatCurrency(rawSubtotal)}</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>−{formatCurrency(discountAmt)}</span>
            </div>
          )}
          {receipt.tax > 0 && (
            <div className="flex justify-between text-[#EEEEEE]/50">
              <span>Tax ({receipt.tax}%)</span>
              <span>{formatCurrency(taxAmt)}</span>
            </div>
          )}
          {receipt.serviceCharge > 0 && (
            <div className="flex justify-between text-[#EEEEEE]/50">
              <span>Service ({receipt.serviceCharge}%)</span>
              <span>{formatCurrency(serviceAmt)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#EEEEEE] font-bold border-t border-[#393E46] pt-1.5">
            <span>Grand Total</span>
            <span className="text-[#00ADB5]">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Per person with settle toggle */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Per Person</p>
        <div className="space-y-2">
          {shares.map((share) => {
            const settled = settledBy.includes(share.name)
            const isPayer = receipt.paidBy === share.name
            return (
              <div
                key={share.name}
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all ${settled ? 'bg-[#222831]/50' : 'bg-[#222831]'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-medium break-words text-sm ${settled ? 'line-through text-[#EEEEEE]/30' : 'text-[#EEEEEE]'}`}>
                    {share.name}
                  </p>
                  {isPayer && <p className="text-[#00ADB5]/70 text-xs">paid upfront</p>}
                  {!isPayer && receipt.paidBy && <p className="text-[#EEEEEE]/30 text-xs">owes {receipt.paidBy}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <p className={`font-bold ${settled ? 'text-[#EEEEEE]/30' : 'text-[#00ADB5]'}`}>
                    {formatCurrency(share.total)}
                  </p>
                  {!isPayer && (
                    <button
                      type="button"
                      onClick={() => toggleSettle(share.name)}
                      title={settled ? 'Mark as unpaid' : 'Mark as settled'}
                      aria-label={settled ? `Mark ${share.name} as unpaid` : `Mark ${share.name} as settled`}
                      className="w-11 h-11 flex items-center justify-center cursor-pointer group"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        settled
                          ? 'bg-green-500 text-white'
                          : 'bg-[#393E46] text-[#EEEEEE]/40 group-hover:text-[#EEEEEE]'
                      }`}>
                        <Check size={12} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {qr && (
        <div className="bg-[#222831] rounded-xl p-3 flex items-center gap-3 sm:gap-4">
          <img src={qr} alt="DuitNow QR" className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white p-1 object-contain shrink-0" />
          <div>
            <p className="text-[#EEEEEE] text-sm font-semibold">Pay via DuitNow</p>
            <p className="text-[#EEEEEE]/40 text-xs mt-0.5">Included in the PDF and shared file.</p>
          </div>
        </div>
      )}
    </div>
  )
}
