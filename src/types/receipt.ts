export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  assignedTo: string[]
}

export type SplitMode = 'equal' | 'itemized' | 'percentage'

export type ReceiptCategory = 'food' | 'transport' | 'accommodation' | 'entertainment' | 'shopping' | 'utilities' | 'other'

export interface Receipt {
  id: string
  title: string
  items: ReceiptItem[]
  tax: number
  serviceCharge: number
  discount: number
  participants: string[]
  splitMode: SplitMode
  percentages: Record<string, number>
  paidBy: string
  category: ReceiptCategory
  settledBy: string[]
  date: string
}
