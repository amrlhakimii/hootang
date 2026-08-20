export type SpendingCategory = 'food' | 'groceries' | 'transport' | 'shopping' | 'entertainment' | 'health' | 'bills' | 'other'

export type PaymentMethod = 'cash' | 'card' | 'apple_pay' | 'qr' | 'tng' | 'shopee'

export type ShopeePayMethod = 'wallet' | 'spaylater_1' | 'spaylater_3' | 'spaylater_6'

export interface Spending {
  id: string
  description: string
  amount: number
  category: SpendingCategory
  date: string
  paymentMethod: PaymentMethod
  shopeeMethod?: ShopeePayMethod
}
