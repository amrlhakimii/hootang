import { type Loan, type LoanStatus } from '../types/loan'
import { useLocalStorage } from './useLocalStorage'
import { generateID } from '../utils/generateID'

export function useLoans() {
  const [loans, setLoans] = useLocalStorage<Loan[]>('hootang_loans', [])

  const addLoan = (data: Omit<Loan, 'id' | 'status'>) => {
    const loan: Loan = { ...data, id: generateID(), status: 'pending' }
    setLoans((prev) => [loan, ...prev])
  }

  const updateStatus = (id: string, status: LoanStatus) => {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id))
  }

  const totalOwed = loans
    .filter((l) => l.type === 'lent' && l.status === 'pending')
    .reduce((sum, l) => sum + l.amount, 0)

  const totalOwing = loans
    .filter((l) => l.type === 'borrowed' && l.status === 'pending')
    .reduce((sum, l) => sum + l.amount, 0)

  return { loans, addLoan, updateStatus, deleteLoan, totalOwed, totalOwing }
}
