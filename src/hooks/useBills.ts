import { useEffect } from 'react'
import { type Bill, type BillStatus } from '../types/bill'
import { useFirestoreCollection } from './useFirestoreCollection'
import { generateID } from '../utils/generateID'

function isBeforeCurrentMonth(dateStr: string, now: Date): boolean {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  return d.getFullYear() < now.getFullYear() ||
    (d.getFullYear() === now.getFullYear() && d.getMonth() < now.getMonth())
}

function rollToCurrentMonth(dateStr: string, now: Date): string {
  let d = new Date(dateStr)
  while (isBeforeCurrentMonth(d.toISOString().slice(0, 10), now)) {
    d = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }
  return d.toISOString().slice(0, 10)
}

export function useBills() {
  const [bills, setBills] = useFirestoreCollection<Bill>('hootang_bills', 'bills')

  // Recurring bills marked paid should reopen once their due month has passed.
  useEffect(() => {
    if (!bills.length) return
    const now = new Date()
    const dueForReopen = bills.filter(
      (b) => b.recurring && b.status === 'paid' && b.dueDate && isBeforeCurrentMonth(b.dueDate, now)
    )
    if (!dueForReopen.length) return
    setBills((prev) =>
      prev.map((b) =>
        dueForReopen.some((d) => d.id === b.id)
          ? { ...b, status: 'pending', dueDate: rollToCurrentMonth(b.dueDate, now) }
          : b
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills])

  const addBill = (data: Omit<Bill, 'id' | 'status'>) => {
    const bill: Bill = { ...data, id: generateID(), status: 'pending' }
    setBills((prev) => [bill, ...prev])
  }

  const updateStatus = (id: string, status: BillStatus) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id))
  }

  const pendingBills = bills.filter((b) => b.status === 'pending')

  return { bills, addBill, updateStatus, deleteBill, pendingBills }
}
