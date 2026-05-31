import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TopHeader } from './components/ui/mobileHeader'
import { FloatingNav } from './components/ui/floatingNav'
import { AppRoutes } from './routes/appRoutes'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#222831]">
          <TopHeader />
          <main className="pb-28">
            <AppRoutes />
          </main>
        </div>
        <FloatingNav />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
