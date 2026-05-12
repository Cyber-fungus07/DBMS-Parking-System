import { Car, Search, Calendar, CarFront, Clock, Coins, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'find',     label: 'Find Parking', icon: Search    },
  { id: 'book',     label: 'My Bookings',  icon: Calendar  },
  { id: 'vehicles', label: 'My Vehicles',  icon: CarFront  },
  { id: 'history',  label: 'History',      icon: Clock     },
  { id: 'rates',    label: 'Rates',        icon: Coins     },
]

export function TopBar({ user, activePage, onNavigate, onLogout }) {
  return (
    <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-6
                       bg-[#0A0A0B] border-b border-[#1E1E21]">
      {/* Logo */}
      <div className="flex items-center gap-2 text-[14px] font-medium">
        <Car className="w-4 h-4 text-indigo-500" />
        <span className="text-[#A1A1AA]">SmartPark</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center h-full gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-1.5 h-full px-3 text-[13px] border-b-2 transition-all duration-150 cursor-pointer
              ${activePage === id
                ? 'text-white border-indigo-500'
                : 'text-[#52525B] border-transparent hover:text-[#A1A1AA]'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
          {user?.D_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="hidden sm:block">
          <div className="text-[13px] font-medium leading-tight">{user?.D_name}</div>
          <div className="text-[11px] text-[#52525B] leading-tight">{user?.Phone}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#52525B] border border-[#2A2A2D]
                     rounded hover:text-white hover:border-[#52525B] transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          Logout
        </button>
      </div>
    </header>
  )
}
