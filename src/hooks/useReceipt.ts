import { type Receipt } from '../types/receipt'
import { useLocalStorage } from './useLocalStorage'
import { generateID } from '../utils/generateID'

export function useReceipts() {
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('hootang_receipts', [])

  const addReceipt = (data: Omit<Receipt, 'id'>) => {
    const receipt: Receipt = { ...data, id: generateID() }
    setReceipts((prev) => [receipt, ...prev])
  }

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }

  return { receipts, addReceipt, deleteReceipt }
}
