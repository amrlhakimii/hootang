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
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/bills', icon: Receipt, label: 'Bills' },
  { to: '/subscriptions', icon: Tv, label: 'Subs' },
  { to: '/receipt', icon: UtensilsCrossed, label: 'Split' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/dice', icon: Dice5, label: 'Dice' },
  { to: '/history', icon: History, label: 'History' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#393E46] border-t border-[#222831] flex overflow-x-auto">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[56px] py-2 text-[10px] transition-colors ${
              isActive
                ? 'text-[#00ADB5]'
                : 'text-[#EEEEEE]/40 active:text-[#EEEEEE]'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
