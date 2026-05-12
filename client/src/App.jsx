import { useState, useEffect } from 'react'
import { AuthScreen }  from './components/auth/AuthScreen'
import { TopBar }      from './components/layout/TopBar'
import { FindParking } from './components/pages/FindParking'
import { MyBookings }  from './components/pages/MyBookings'
import { MyVehicles }  from './components/pages/MyVehicles'
import { History }     from './components/pages/History'
import { Rates }       from './components/pages/Rates'
import { Toast }       from './components/ui/Toast'
import { useToast }    from './hooks/useToast'
import { AdminDashboard, AdminDrivers, AdminVehicles, AdminReservations, AdminLogs } from './components/pages/admin/AdminPages'

export default function App() {
  const [user, setUser]         = useState(() => JSON.parse(sessionStorage.getItem('parkUser') || 'null'))
  const [activePage, setActivePage] = useState('find')
  const { toast, showToast }    = useToast()
  const [theme, setTheme]       = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  function handleLoginSuccess(driver) {
    sessionStorage.setItem('parkUser', JSON.stringify(driver))
    setUser(driver)
    setActivePage(driver.role === 'admin' ? 'dashboard' : 'find')
  }

  function handleLogout() {
    sessionStorage.removeItem('parkUser')
    setUser(null)
  }

  function navigate(page) {
    setActivePage(page)
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />
  }

  const pageProps = { user, showToast }
  const isAdmin = user.role === 'admin'

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-main)]">
      <TopBar
        user={user}
        activePage={activePage}
        onNavigate={navigate}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main>
        {isAdmin ? (
          <>
            {activePage === 'dashboard'    && <AdminDashboard    key="dash"  {...pageProps} />}
            {activePage === 'reservations' && <AdminReservations key="res"   {...pageProps} />}
            {activePage === 'logs'         && <AdminLogs         key="logs"  {...pageProps} />}
            {activePage === 'drivers'      && <AdminDrivers      key="drvs"  {...pageProps} />}
            {activePage === 'vehicles'     && <AdminVehicles     key="veh"   {...pageProps} />}
          </>
        ) : (
          <>
            {activePage === 'find'     && <FindParking  key="find"     {...pageProps} />}
            {activePage === 'book'     && <MyBookings   key="book"     {...pageProps} />}
            {activePage === 'vehicles' && <MyVehicles   key="vehicles" {...pageProps} />}
            {activePage === 'history'  && <History      key="history"  {...pageProps} />}
            {activePage === 'rates'    && <Rates        key="rates"               />}
          </>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  )
}
