import { type Loan } from '../../types/loan'
import { LoanItem } from './loanItem'
import { EmptyState } from '../../components/layout/emptyState'

interface LoanTableProps {
  loans: Loan[]
  onSettle: (id: string) => void
  onDelete: (id: string) => void
}

export function LoanTable({ loans, onSettle, onDelete }: LoanTableProps) {
  if (loans.length === 0) {
    return (
      <EmptyState
        icon="💸"
        title="No debt yet, nice life 😎"
        description="Add a loan to start tracking"
      />
    )
  }

  return (
    <div>
      {loans.map((loan) => (
        <LoanItem key={loan.id} loan={loan} onSettle={onSettle} onDelete={onDelete} />
      ))}
    </div>
  )
}
