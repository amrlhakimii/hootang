import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold cursor-pointer transition-opacity active:opacity-70"
        style={{ background: '#00ADB520', border: '1.5px solid #00ADB540', color: '#00ADB5' }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-52 rounded-2xl p-1 z-50"
          style={{
            background: '#2d3440',
            border: '1px solid rgba(238,238,238,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: 'rgba(238,238,238,0.06)' }}>
            <p className="text-[#EEEEEE] text-sm font-semibold truncate">{user.displayName ?? 'You'}</p>
            <p className="text-[#EEEEEE]/40 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            style={{ color: '#ff6b6b' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
