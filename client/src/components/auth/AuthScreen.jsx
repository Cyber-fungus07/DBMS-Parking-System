import { useState } from 'react'
import { Car } from 'lucide-react'
import { api } from '../../lib/api'

export function AuthScreen({ onLoginSuccess }) {
  const [tab, setTab] = useState('login')

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0A0A0B] z-50 px-4">
      <div className="w-full max-w-sm bg-[#111113] border border-[#1E1E21] rounded-xl p-8 text-center">
        {/* Logo */}
        <div className="w-8 h-8 mx-auto mb-4 bg-indigo-500 rounded-md flex items-center justify-center">
          <Car className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-[18px] font-medium text-white mb-1">SmartPark</h2>
        <p className="text-[13px] text-[#52525B] mb-6">Driver Portal</p>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#1C1C1F] rounded-lg mb-6">
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-[13px] rounded-md transition-all duration-150 cursor-pointer
                ${tab === t
                  ? 'bg-[#18181B] text-white shadow'
                  : 'text-[#A1A1AA] hover:text-white'}`}
            >
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {tab === 'login'
          ? <LoginForm onLoginSuccess={onLoginSuccess} />
          : <RegisterForm onLoginSuccess={onLoginSuccess} />}

        <a href="/" className="inline-block mt-6 text-[12px] text-[#52525B] hover:text-white transition-colors">
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
      <label className="block text-[11px] uppercase tracking-wider text-[#52525B] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
