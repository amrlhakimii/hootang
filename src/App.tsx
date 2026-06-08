import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { TopHeader } from './components/ui/mobileHeader'
import { FloatingNav } from './components/ui/floatingNav'
import { FloatingBackground } from './components/ui/floatingBackground'
import { CreditBadge } from './components/ui/creditBadge'
import { AppRoutes } from './routes/appRoutes'
import { LoginPage } from './features/auth/LoginPage'
import { usePushNotifications } from './hooks/usePushNotifications'

function AppContent() {
  const { user, authLoading } = useAuth()
  usePushNotifications()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#222831] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#393E46] border-t-[#00ADB5] animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <FloatingBackground />
      <div className="min-h-screen relative" style={{ zIndex: 1 }}>
        <TopHeader />
        <main style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
          <AppRoutes />
        </main>
      </div>
      <FloatingNav />
      <CreditBadge />
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
