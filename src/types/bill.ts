export type BillStatus = 'pending' | 'paid'
export type BillCategory = 'rent' | 'internet' | 'utilities' | 'mobile' | 'other'

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  status: BillStatus
  category: BillCategory
  recurring: boolean
}
