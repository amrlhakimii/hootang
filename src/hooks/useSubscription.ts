import { type Subscription } from '../types/subscription'
import { useLocalStorage } from './useLocalStorage'
import { generateID } from '../utils/generateID'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('hootang_subs', [])

  const addSubscription = (data: Omit<Subscription, 'id'>) => {
    const sub: Subscription = { ...data, id: generateID() }
    setSubscriptions((prev) => [sub, ...prev])
  }

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }

  const togglePayment = (subId: string, participantName: string, month: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== subId) return sub
        return {
          ...sub,
          participants: sub.participants.map((p) => {
            if (p.name !== participantName) return p
            const existing = p.payments.find((pay) => pay.month === month)
            if (existing) {
              return {
                ...p,
                payments: p.payments.map((pay) =>
                  pay.month === month ? { ...pay, paid: !pay.paid } : pay
                ),
              }
            }
            return { ...p, payments: [...p.payments, { month, paid: true }] }
          }),
        }
      })
    )
  }

  return { subscriptions, addSubscription, deleteSubscription, togglePayment }
}
