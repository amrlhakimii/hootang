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

export function FloatingNav() {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <nav
        className="flex items-center gap-1 p-1.5 rounded-full"
        style={{
          background: 'rgba(34, 40, 49, 0.65)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
        }}
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={() => 'relative flex items-center justify-center rounded-full w-10 h-10 md:w-11 md:h-11 transition-all duration-200'}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(145deg, #00C9D2, #008f96)',
                      boxShadow: '0 0 16px rgba(0,173,181,0.5)',
                    }}
                  />
                )}
                <span
                  className="relative z-10"
                  style={{ color: isActive ? '#222831' : 'rgba(238,238,238,0.45)' }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.75} />
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
