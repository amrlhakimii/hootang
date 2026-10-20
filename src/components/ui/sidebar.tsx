import { NavLink } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import {
  LayoutDashboard,
  HandCoins,
  Receipt,
  Tv,
  UtensilsCrossed,
  Users,
  Dice5,
  History,
  Wallet,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/spending', icon: Wallet, label: 'Spending' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/bills', icon: Receipt, label: 'Bills' },
  { to: '/subscriptions', icon: Tv, label: 'Subscriptions' },
  { to: '/receipt', icon: UtensilsCrossed, label: 'Receipt Splitter' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/dice', icon: Dice5, label: 'Dice Roller' },
  { to: '/history', icon: History, label: 'History' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-[#393E46] min-h-screen flex-col border-r border-[#222831]">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#222831]">
        <div className="flex items-center gap-2.5">
          <img src="/hootanglogo.png" alt="Hootang" className="w-8 h-8 object-contain" />
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-[#EEEEEE] leading-none text-sm tracking-wide">Hootang</p>
            <p className="text-xs text-[#EEEEEE]/40 mt-0.5">Track. Split. Settle.</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-[#00ADB5]/15 text-[#00ADB5] font-medium'
                  : 'text-[#EEEEEE]/50 hover:text-[#EEEEEE] hover:bg-[#222831]/50'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#222831]">
        {user && (
          <div className="flex items-center gap-2.5 px-2 pb-3">
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#00ADB520', border: '1.5px solid #00ADB540', color: '#00ADB5' }}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[#EEEEEE] text-sm font-semibold truncate">{user.displayName ?? 'You'}</p>
              <p className="text-[#EEEEEE]/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}
        {user && (
          <button
            onClick={async () => {
              try {
                await logout()
              } catch {
                toast('Could not sign out. Try again.', 'error')
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
          >
            <LogOut size={16} />
            Sign out
          </button>
        )}
        <p className="text-xs text-[#EEEEEE]/25 px-3 pt-3">Friendship safe, wallet safe.</p>
      </div>
    </aside>
  )
}
