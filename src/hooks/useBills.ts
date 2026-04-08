import { type Bill, type BillStatus } from '../types/bill'
import { useLocalStorage } from './useLocalStorage'
import { generateID } from '../utils/generateID'

export function useBills() {
  const [bills, setBills] = useLocalStorage<Bill[]>('hootang_bills', [])

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
