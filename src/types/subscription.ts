export type BillingCycle = 'monthly' | 'yearly'

export interface PaymentRecord {
  month: string // e.g. "2025-01"
  paid: boolean
}

export interface SubscriptionParticipant {
  friendId: string
  name: string
  payments: PaymentRecord[]
}

export interface Subscription {
  id: string
  name: string
  totalAmount: number
  billingCycle: BillingCycle
  participants: SubscriptionParticipant[]
  startDate: string
}
