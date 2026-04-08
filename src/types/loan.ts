export type LoanType = 'lent' | 'borrowed'
export type LoanStatus = 'pending' | 'settled'

export interface Loan {
  id: string
  person: string
  amount: number
  type: LoanType
  status: LoanStatus
  date: string
  dueDate: string
  notes: string
}
