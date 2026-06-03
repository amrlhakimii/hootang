import { type Receipt } from '../../types/receipt'
import { calculateReceiptSplit } from '../../utils/calculateSplit'
import { formatCurrency } from '../../utils/formatCurrency'

interface SplitSummaryProps {
  receipt: Omit<Receipt, 'id'>
}

export function SplitSummary({ receipt }: SplitSummaryProps) {
  const shares = calculateReceiptSplit(receipt)
  const rawSubtotal = receipt.items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)
  const discountAmt = Math.min(receipt.discount ?? 0, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt
  const taxAmt = subtotal * (receipt.tax / 100)
  const serviceAmt = subtotal * (receipt.serviceCharge / 100)
  const grandTotal = subtotal + taxAmt + serviceAmt

  return (
    <div className="space-y-3">
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

      <div className="space-y-2">
        {shares.map((share) => (
          <div key={share.name} className="flex items-center justify-between bg-[#222831] rounded-xl px-4 py-3">
            <div>
              <p className="text-[#EEEEEE] font-medium text-sm">{share.name}</p>
              {receipt.paidBy && receipt.paidBy !== share.name && (
                <p className="text-[#EEEEEE]/40 text-xs">owes {receipt.paidBy}</p>
              )}
              {receipt.paidBy === share.name && (
                <p className="text-[#00ADB5]/70 text-xs">paid upfront</p>
              )}
            </div>
            <p className="text-[#00ADB5] font-bold">{formatCurrency(share.total)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
