import { type Receipt, type ReceiptItem } from '../types/receipt'

export interface PersonShare {
  name: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  serviceAmount: number
  total: number
}

export function getItemTotal(item: ReceiptItem): number {
  return item.price * (item.quantity ?? 1)
}

export function getItemShares(item: ReceiptItem): Record<string, number> {
  const shares: Record<string, number> = {}
  if (item.assignedTo.length === 0) return shares
  if (item.customAmounts) {
    item.assignedTo.forEach((p) => (shares[p] = item.customAmounts?.[p] ?? 0))
    return shares
  }
  const each = getItemTotal(item) / item.assignedTo.length
  item.assignedTo.forEach((p) => (shares[p] = each))
  return shares
}

export function getCustomAmountsDiff(item: ReceiptItem): number {
  if (!item.customAmounts || item.assignedTo.length === 0) return 0
  const sum = item.assignedTo.reduce((s, p) => s + (item.customAmounts?.[p] ?? 0), 0)
  return getItemTotal(item) - sum
}

export function hasInvalidCustomAmounts(items: ReceiptItem[]): boolean {
  return items.some((i) => Math.abs(getCustomAmountsDiff(i)) > 0.005)
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
    Object.entries(getItemShares(item)).forEach(([person, amount]) => {
      if (shareMap[person] !== undefined) shareMap[person] += amount
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
