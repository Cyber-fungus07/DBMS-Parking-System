import { useState } from 'react'
import { AuthScreen }  from './components/auth/AuthScreen'
import { TopBar }      from './components/layout/TopBar'
import { FindParking } from './components/pages/FindParking'
import { MyBookings }  from './components/pages/MyBookings'
import { MyVehicles }  from './components/pages/MyVehicles'
import { History }     from './components/pages/History'
import { Rates }       from './components/pages/Rates'
import { Toast }       from './components/ui/Toast'
import { useToast }    from './hooks/useToast'

export default function App() {
  const [user, setUser]         = useState(() => JSON.parse(sessionStorage.getItem('parkUser') || 'null'))
  const [activePage, setActivePage] = useState('find')
  const { toast, showToast }    = useToast()

  function handleLoginSuccess(driver) {
    sessionStorage.setItem('parkUser', JSON.stringify(driver))
    setUser(driver)
    setActivePage('find')
  }

  function handleLogout() {
    sessionStorage.removeItem('parkUser')
    setUser(null)
  }

  function navigate(page) {
    setActivePage(page)
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />
  }

  const pageProps = { user, showToast }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <TopBar
        user={user}
        activePage={activePage}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      <main>
        {activePage === 'find'     && <FindParking  key="find"     {...pageProps} />}
        {activePage === 'book'     && <MyBookings   key="book"     {...pageProps} />}
        {activePage === 'vehicles' && <MyVehicles   key="vehicles" {...pageProps} />}
        {activePage === 'history'  && <History      key="history"  {...pageProps} />}
        {activePage === 'rates'    && <Rates        key="rates"               />}
      </main>

      <Toast toast={toast} />
    </div>
  )
}
