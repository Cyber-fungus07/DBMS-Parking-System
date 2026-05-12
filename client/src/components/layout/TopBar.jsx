import { Car, Search, Calendar, CarFront, Clock, Coins, LogOut, Sun, Moon, LayoutDashboard, Users, Activity } from 'lucide-react'

const USER_NAV_ITEMS = [
  { id: 'find',     label: 'Find Parking', icon: Search    },
  { id: 'book',     label: 'My Bookings',  icon: Calendar  },
  { id: 'vehicles', label: 'My Vehicles',  icon: CarFront  },
  { id: 'history',  label: 'History',      icon: Clock     },
  { id: 'rates',    label: 'Rates',        icon: Coins     },
]

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'reservations', label: 'Reservations', icon: Calendar },
  { id: 'logs',         label: 'Logs',         icon: Activity },
  { id: 'drivers',      label: 'Drivers',      icon: Users },
  { id: 'vehicles',     label: 'Vehicles',     icon: CarFront },
]

export function TopBar({ user, activePage, onNavigate, onLogout, theme, toggleTheme }) {
  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS

  return (
    <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-6
                       bg-[var(--bg-color)] border-b border-[var(--card-border)]">
      {/* Logo */}
      <div className="flex items-center gap-2 text-[14px] font-medium serif-font">
        <Car className="w-4 h-4 text-[var(--text-main)]" />
        <span className="text-[var(--text-main)] font-bold">SmartPark {isAdmin && <span className="text-[var(--accent)] ml-1">Admin</span>}</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center h-full gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-1.5 h-full px-3 text-[13px] border-b-2 transition-all duration-150 cursor-pointer
              ${activePage === id
                ? 'text-[var(--text-main)] border-[var(--accent)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-main)]'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-[var(--accent)] rounded-sm flex items-center justify-center text-[10px] font-semibold text-[var(--accent-fg)]">
          {user?.D_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-[13px] font-medium leading-tight text-[var(--text-main)]">{user?.D_name}</div>
          <div className="text-[11px] text-[var(--text-muted)] leading-tight">{isAdmin ? 'Administrator' : user?.Phone}</div>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-7 h-7 text-[var(--text-muted)] border border-[var(--card-border)]
                     rounded-sm hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all duration-150 cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-[var(--text-muted)] border border-[var(--card-border)]
                     rounded-sm hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </header>
  )
}
