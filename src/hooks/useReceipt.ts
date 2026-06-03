import { type Receipt } from '../types/receipt'
import { useFirestoreCollection } from './useFirestoreCollection'
import { generateID } from '../utils/generateID'

export function useReceipts() {
  const [receipts, setReceipts] = useFirestoreCollection<Receipt>('hootang_receipts', 'receipts')

  const addReceipt = (data: Omit<Receipt, 'id'>) => {
    const receipt: Receipt = { ...data, id: generateID() }
    setReceipts((prev) => [receipt, ...prev])
  }

  const updateReceipt = (updated: Receipt) => {
    setReceipts((prev) => prev.map((r) => r.id === updated.id ? updated : r))
  }

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }

  return { receipts, addReceipt, updateReceipt, deleteReceipt }
}
