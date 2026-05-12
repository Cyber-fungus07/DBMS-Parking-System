import { useState } from 'react'
import { Car, ShieldCheck, Sun, Moon } from 'lucide-react'
import { api } from '../../lib/api'

export function AuthScreen({ onLoginSuccess, theme, toggleTheme }) {
  const [portal, setPortal] = useState('driver') // 'driver' | 'admin'
  const [tab, setTab] = useState('login')

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-color)] z-50 px-4">
      <div className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--card-border)] rounded-sm p-8 text-center relative">
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 text-[var(--text-muted)] border border-[var(--card-border)]
                     rounded-sm hover:text-[var(--text-main)] hover:border-[var(--accent)] transition-all duration-150 cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {/* Logo */}
        <div className="w-8 h-8 mx-auto mb-4 bg-[var(--accent)] rounded-sm flex items-center justify-center">
          {portal === 'driver' ? <Car className="w-4 h-4 text-[var(--accent-fg)]" /> : <ShieldCheck className="w-4 h-4 text-[var(--accent-fg)]" />}
        </div>
        <h2 className="text-[20px] font-medium text-[var(--text-main)] mb-1 serif-font">SmartPark</h2>
        <p className="text-[13px] text-[var(--text-muted)] mb-6">{portal === 'driver' ? 'Driver Portal' : 'Admin Portal'}</p>

        {/* Portal Toggle */}
        <div className="flex gap-2 p-1 bg-[var(--card-muted)] border border-[var(--card-border)] rounded-sm mb-6">
          <button
            onClick={() => setPortal('driver')}
            className={`flex-1 py-1.5 text-[13px] rounded-sm transition-all duration-150 cursor-pointer
              ${portal === 'driver' ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Driver Portal
          </button>
          <button
            onClick={() => setPortal('admin')}
            className={`flex-1 py-1.5 text-[13px] rounded-sm transition-all duration-150 cursor-pointer
              ${portal === 'admin' ? 'bg-[var(--accent)] text-[var(--accent-fg)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Admin Portal
          </button>
        </div>

        {portal === 'driver' && (
          <>
            {/* Tabs for Driver */}
            <div className="flex gap-4 justify-center mb-6 border-b border-[#E5E5E5]">
              <button
                onClick={() => setTab('login')}
                className={`pb-2 text-[13px] font-medium transition-colors ${tab === 'login' ? 'text-[var(--text-main)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                Login
              </button>
              <button
                onClick={() => setTab('register')}
                className={`pb-2 text-[13px] font-medium transition-colors ${tab === 'register' ? 'text-[var(--text-main)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              >
                Register
              </button>
            </div>
            {tab === 'login' ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <RegisterForm onLoginSuccess={onLoginSuccess} />}
          </>
        )}

        {portal === 'admin' && <AdminLoginForm onLoginSuccess={onLoginSuccess} />}

        <a href="/" className="inline-block mt-6 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          ← Back to Home
        </a>
      </div>
    </div>
  )
}

function LoginForm({ onLoginSuccess }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e?.preventDefault()
    setError('')
    if (!phone.trim()) { setError('Please enter your phone number'); return }
    try {
      const driver = await api('/api/user/login', 'POST', { phone: phone.trim() })
      onLoginSuccess(driver)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={handleLogin} className="text-left">
      <FormField label="Phone Number">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter your registered phone"
          className="input-base"
        />
      </FormField>
      <button type="submit" className="btn-primary-full">Login →</button>
      {error && <p className="mt-3 text-[12px] text-red-300">{error}</p>}
    </form>
  )
}

function RegisterForm({ onLoginSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')

  const update = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleRegister(e) {
    e?.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.email) { setError('All fields are required'); return }
    try {
      const driver = await api('/api/user/register', 'POST', {
        D_name: form.name.trim(), Phone: form.phone.trim(), Email: form.email.trim()
      })
      onLoginSuccess(driver)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={handleRegister} className="text-left">
      <FormField label="Full Name">
        <input value={form.name} onChange={update('name')} placeholder="Your name" className="input-base" />
      </FormField>
      <FormField label="Phone Number">
        <input type="tel" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" className="input-base" />
      </FormField>
      <FormField label="Email">
        <input type="email" value={form.email} onChange={update('email')} placeholder="your@email.com" className="input-base" />
      </FormField>
      <button type="submit" className="btn-primary-full">Create Account →</button>
      {error && <p className="mt-3 text-[12px] text-red-300">{error}</p>}
    </form>
  )
}

function FormField({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5 font-bold">{label}</label>
      {children}
    </div>
  )
}

function AdminLoginForm({ onLoginSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (!password.trim()) { 
      setError('Please enter admin password')
      return 
    }
    if (password === 'admin') {
      onLoginSuccess({ D_name: 'Admin', role: 'admin' })
    } else {
      setError('Invalid admin password (try "admin")')
    }
  }

  return (
    <form onSubmit={handleLogin} className="text-left">
      <FormField label="Admin Password">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password (admin)"
          className="input-base"
        />
      </FormField>
      <button type="submit" className="btn-primary-full">Access Dashboard →</button>
      {error && <p className="mt-3 text-[12px] text-red-300">{error}</p>}
    </form>
  )
}
