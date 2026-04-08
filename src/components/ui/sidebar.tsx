import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  HandCoins,
  Receipt,
  Tv,
  UtensilsCrossed,
  Users,
  Dice5,
  History,
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/bills', icon: Receipt, label: 'Bills' },
  { to: '/subscriptions', icon: Tv, label: 'Subscriptions' },
  { to: '/receipt', icon: UtensilsCrossed, label: 'Receipt Splitter' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/dice', icon: Dice5, label: 'Dice Roller' },
  { to: '/history', icon: History, label: 'History' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 bg-[#393E46] min-h-screen flex-col border-r border-[#222831]">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#222831]">
        <div className="flex items-center gap-2.5">
          <img src="/hootanglogo.png" alt="Hootang" className="w-8 h-8 object-contain" />
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif" }} className="font-bold text-[#EEEEEE] leading-none text-sm tracking-wide">Hootang</p>
            <p className="text-[10px] text-[#EEEEEE]/40 mt-0.5">Track. Split. Settle.</p>
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
      <div className="px-6 py-4 border-t border-[#222831]">
        <p className="text-[10px] text-[#EEEEEE]/20">Friendship safe, wallet safe.</p>
      </div>
    </aside>
  )
}
