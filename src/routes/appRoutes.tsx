import { Routes, Route } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/dashboardPage'
import { LoanPage } from '../features/loans/loanPage'
import { BillPage } from '../features/bills/billPage'
import { SubscriptionPage } from '../features/subscriptions/subscriptionPage'
import { ReceiptPage } from '../features/receipt/receiptPage'
import { FriendsPage } from '../features/friends/friendsPage'
import { DicePage } from '../features/dice/dicePage'
import { HistoryPage } from '../features/history/historyPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/loans" element={<LoanPage />} />
      <Route path="/bills" element={<BillPage />} />
      <Route path="/subscriptions" element={<SubscriptionPage />} />
      <Route path="/receipt" element={<ReceiptPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/dice" element={<DicePage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  )
}
