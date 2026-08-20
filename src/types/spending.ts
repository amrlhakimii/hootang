export type SpendingCategory = 'food' | 'groceries' | 'transport' | 'shopping' | 'entertainment' | 'health' | 'bills' | 'other'

export interface Spending {
  id: string
  description: string
  amount: number
  category: SpendingCategory
  date: string
}
