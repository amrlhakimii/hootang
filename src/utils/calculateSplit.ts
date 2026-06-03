import { type Receipt } from '../types/receipt'

export interface PersonShare {
  name: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  serviceAmount: number
  total: number
}

export function calculateReceiptSplit(receipt: Omit<Receipt, 'id'>): PersonShare[] {
  const { items, tax, serviceCharge, participants, splitMode } = receipt
  const discount = receipt.discount ?? 0
  const percentages = receipt.percentages ?? {}
  const taxRate = tax / 100
  const serviceRate = serviceCharge / 100

  const rawSubtotal = items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)
  const discountAmt = Math.min(discount, rawSubtotal)
  const subtotal = rawSubtotal - discountAmt

  if (splitMode === 'equal') {
    const taxAmt = subtotal * taxRate
    const serviceAmt = subtotal * serviceRate
    const total = subtotal + taxAmt + serviceAmt
    const n = participants.length || 1

    return participants.map((name) => ({
      name,
      subtotal: rawSubtotal / n,
      discountAmount: discountAmt / n,
      taxAmount: taxAmt / n,
      serviceAmount: serviceAmt / n,
      total: total / n,
    }))
  }

  if (splitMode === 'percentage') {
    const taxAmt = subtotal * taxRate
    const serviceAmt = subtotal * serviceRate
    const grandTotal = subtotal + taxAmt + serviceAmt

    return participants.map((name) => {
      const pct = (percentages[name] ?? 0) / 100
      return {
        name,
        subtotal: rawSubtotal * pct,
        discountAmount: discountAmt * pct,
        taxAmount: taxAmt * pct,
        serviceAmount: serviceAmt * pct,
        total: grandTotal * pct,
      }
    })
  }

  // itemized
  const shareMap: Record<string, number> = {}
  participants.forEach((p) => (shareMap[p] = 0))

  items.forEach((item) => {
    if (item.assignedTo.length === 0) return
    const itemTotal = item.price * (item.quantity ?? 1)
    const pricePerPerson = itemTotal / item.assignedTo.length
    item.assignedTo.forEach((person) => {
      if (shareMap[person] !== undefined) shareMap[person] += pricePerPerson
    })
  })

  const discountRatio = rawSubtotal > 0 ? discountAmt / rawSubtotal : 0

  return participants.map((name) => {
    const personRaw = shareMap[name] ?? 0
    const personDiscount = personRaw * discountRatio
    const personSubtotal = personRaw - personDiscount
    const taxAmt = personSubtotal * taxRate
    const serviceAmt = personSubtotal * serviceRate
    return {
      name,
      subtotal: personRaw,
      discountAmount: personDiscount,
      taxAmount: taxAmt,
      serviceAmount: serviceAmt,
      total: personSubtotal + taxAmt + serviceAmt,
    }
  })
}
