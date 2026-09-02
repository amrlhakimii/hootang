import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBills } from './useBills'
import { useSubscriptions } from './useSubscription'
import { useReceipts } from './useReceipt'
import { useSpendings } from './useSpending'
import { getCostPerPerson } from '../utils/calculateSubscription'
import { calculateReceiptSplit } from '../utils/calculateSplit'
import { toDateKey, monthKeyOf } from '../utils/formatDate'

export function useSpendingTotals() {
  const { user } = useAuth()
  const ME = (user?.displayName ?? '').trim().toLowerCase()
  const { bills } = useBills()
  const { subscriptions } = useSubscriptions()
  const { receipts } = useReceipts()
  const { spendings } = useSpendings()

  return useMemo(() => {
    const now = new Date()
    const todayStr = toDateKey(now)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    const startOfWeekStr = toDateKey(startOfWeek)
    const currentMonth = monthKeyOf(todayStr)

    let today = 0
    let week = 0
    let month = 0

    const add = (date: string, amount: number) => {
      if (monthKeyOf(date) === currentMonth) month += amount
      if (date >= startOfWeekStr && date <= todayStr) week += amount
      if (date === todayStr) today += amount
    }

    for (const b of bills) {
      if (b.dueDate) add(b.dueDate, b.amount)
    }
    for (const s of subscriptions) {
      if (!s.startDate) continue
      const start = new Date(s.startDate)
      const startKey = start.getFullYear() * 12 + start.getMonth()
      const targetKey = now.getFullYear() * 12 + now.getMonth()
      if (targetKey < startKey) continue
      if (s.billingCycle === 'yearly' && start.getMonth() !== now.getMonth()) continue
      add(`${currentMonth}-01`, getCostPerPerson(s))
    }
    for (const r of receipts) {
      if (!r.date) continue
      if (!r.participants.some((p) => p.trim().toLowerCase() === ME)) continue
      const share = calculateReceiptSplit(r).find((s) => s.name.trim().toLowerCase() === ME)
      add(r.date, share?.total ?? 0)
    }
    for (const sp of spendings) {
      add(sp.date, sp.amount)
    }

    return { today, week, month }
  }, [bills, subscriptions, receipts, spendings, ME])
}
