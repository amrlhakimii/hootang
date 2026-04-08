import { type Receipt } from '../types/receipt'

export interface PersonShare {
  name: string
  subtotal: number
  taxAmount: number
  serviceAmount: number
  total: number
}

export function calculateReceiptSplit(receipt: Omit<Receipt, 'id'>): PersonShare[] {
  const { items, tax, serviceCharge, participants, splitMode } = receipt
  const taxRate = tax / 100
  const serviceRate = serviceCharge / 100

  if (splitMode === 'equal') {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const taxAmt = subtotal * taxRate
    const serviceAmt = subtotal * serviceRate
    const total = subtotal + taxAmt + serviceAmt
    const perPerson = total / participants.length

    return participants.map((name) => ({
      name,
      subtotal: subtotal / participants.length,
      taxAmount: taxAmt / participants.length,
      serviceAmount: serviceAmt / participants.length,
      total: perPerson,
    }))
  }

  // itemized
  const shareMap: Record<string, number> = {}
  participants.forEach((p) => (shareMap[p] = 0))

  items.forEach((item) => {
    if (item.assignedTo.length === 0) return
    const pricePerPerson = item.price / item.assignedTo.length
    item.assignedTo.forEach((person) => {
      if (shareMap[person] !== undefined) {
        shareMap[person] += pricePerPerson
      }
    })
  })

  return participants.map((name) => {
    const subtotal = shareMap[name] ?? 0
    const taxAmt = subtotal * taxRate
    const serviceAmt = subtotal * serviceRate
    return {
      name,
      subtotal,
      taxAmount: taxAmt,
      serviceAmount: serviceAmt,
      total: subtotal + taxAmt + serviceAmt,
    }
  })
}
