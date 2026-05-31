import { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LoginModal } from '../../features/auth/LoginModal'
import { UserMenu } from '../../features/auth/UserMenu'

export function TopHeader() {
  const { user, authLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <header
        className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(34, 40, 49, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(238,238,238,0.04)',
        }}
      >
        <span
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-xl font-extrabold tracking-tight"
        >
          <span style={{ color: '#00ADB5' }}>hoo</span>
          <span className="text-[#EEEEEE]">tang</span>
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#EEEEEE]/25 tracking-widest uppercase hidden sm:block">
            Track · Split · Settle
          </span>
          {!authLoading && (
            user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                style={{
                  background: '#00ADB512',
                  border: '1px solid #00ADB530',
                  color: '#00ADB5',
                }}
              >
                <UserCircle size={13} />
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
