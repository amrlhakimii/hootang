export type TransactionCategory = 'loan' | 'bill' | 'subscription' | 'receipt'

export interface Transaction {
  id: string
  category: TransactionCategory
  description: string
  amount: number
  date: string
  refId: string // id of the related entity
}
