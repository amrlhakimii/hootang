import { FileDown } from 'lucide-react'
import { type Receipt } from '../../types/receipt'
import { calculateReceiptSplit } from '../../utils/calculateSplit'
import { formatCurrency } from '../../utils/formatCurrency'
import { generateReceiptPDF } from '../../utils/generateReceiptPDF'
import { Button } from '../../components/layout/button'

interface ReceiptDetailProps {
  receipt: Receipt
}

export function ReceiptDetail({ receipt }: ReceiptDetailProps) {
  const shares = calculateReceiptSplit(receipt)
  const subtotal = receipt.items.reduce((sum, i) => sum + i.price, 0)
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => generateReceiptPDF(receipt)}>
          <FileDown size={14} /> Save PDF
        </Button>
      </div>
      {/* Items */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Items</p>
        <div className="bg-[#222831] rounded-xl divide-y divide-[#393E46]">
          {receipt.items.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-[#EEEEEE] text-sm">{item.name}</span>
                <span className="text-[#EEEEEE]/70 text-sm">{formatCurrency(item.price)}</span>
              </div>
              {receipt.splitMode === 'itemized' && item.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.assignedTo.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-[#EEEEEE]/40">{p}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Summary</p>
        <div className="bg-[#222831] rounded-xl p-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#EEEEEE]/50">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
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

      {/* Per person */}
      <div>
        <p className="text-[#EEEEEE]/50 text-xs font-medium uppercase tracking-wider mb-2">Per Person</p>
        <div className="space-y-2">
          {shares.map((share) => (
            <div key={share.name} className="flex items-center justify-between bg-[#222831] rounded-xl px-4 py-3">
              <p className="text-[#EEEEEE] font-medium text-sm">{share.name}</p>
              <p className="text-[#00ADB5] font-bold">{formatCurrency(share.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
