import { type Spending } from '../types/spending'
import { useFirestoreCollection } from './useFirestoreCollection'
import { generateID } from '../utils/generateID'

export function useSpendings() {
  const [spendings, setSpendings, loading] = useFirestoreCollection<Spending>('hootang_spendings', 'spendings')

  const addSpending = (data: Omit<Spending, 'id'>) => {
    const spending: Spending = { ...data, id: generateID() }
    setSpendings((prev) => [spending, ...prev])
  }

  const updateSpending = (id: string, data: Omit<Spending, 'id'>) => {
    setSpendings((prev) => prev.map((s) => (s.id === id ? { ...data, id } : s)))
  }

  const deleteSpending = (id: string) => {
    setSpendings((prev) => prev.filter((s) => s.id !== id))
  }

  return { spendings, addSpending, updateSpending, deleteSpending, loading }
}
