import { type Subscription } from '../types/subscription'

export function getCostPerPerson(sub: Subscription): number {
  const count = sub.participants.length
  if (count === 0) return 0
  return sub.totalAmount / count
}
