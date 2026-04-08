export interface ReceiptItem {
  id: string
  name: string
  price: number
  assignedTo: string[] // friend names
}

export type SplitMode = 'equal' | 'itemized'

export interface Receipt {
  id: string
  title: string
  items: ReceiptItem[]
  tax: number
  serviceCharge: number
  participants: string[]
  splitMode: SplitMode
  date: string
}
