import { type Budget } from '../types/budget'
import { useFirestoreCollection } from './useFirestoreCollection'

export function useBudgets() {
  const [budgets, setBudgets, loading] = useFirestoreCollection<Budget>('hootang_budgets', 'budgets')

  const setBudget = (category: string, limit: number) => {
    setBudgets((prev) => {
      if (limit <= 0) return prev.filter((b) => b.category !== category)
      const existing = prev.find((b) => b.category === category)
      if (existing) return prev.map((b) => (b.category === category ? { ...b, limit } : b))
      return [...prev, { id: category, category, limit }]
    })
  }

  const removeBudget = (category: string) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category))
  }

  return { budgets, setBudget, removeBudget, loading }
}
