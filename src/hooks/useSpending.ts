import { type Spending } from '../types/spending'
import { useFirestoreCollection } from './useFirestoreCollection'
import { generateID } from '../utils/generateID'

export function useSpendings() {
  const [spendings, setSpendings] = useFirestoreCollection<Spending>('hootang_spendings', 'spendings')

  const addSpending = (data: Omit<Spending, 'id'>) => {
    const spending: Spending = { ...data, id: generateID() }
    setSpendings((prev) => [spending, ...prev])
  }

  const deleteSpending = (id: string) => {
    setSpendings((prev) => prev.filter((s) => s.id !== id))
  }

  return { spendings, addSpending, deleteSpending }
}
