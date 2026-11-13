import { useState } from 'react'
import {
  Building2, LogIn, UserPlus, ShieldCheck, Zap,
  Layers, ArrowRight, Lock, Sun, Moon,
  Users, AlertCircle, Sparkles, Store, KeyRound
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Button from '../components/ui/Button.jsx'
import { TextField } from '../components/ui/Field.jsx'

export default function LandingLogin() {
  const { login, register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { addToast } = useToast()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    if (!form.email || !form.password || (mode === 'register' && !form.name)) {
      setError('Please fill in all required fields.')
      return
    }

    if (mode === 'register' && form.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password)
        addToast(`Welcome back, ${user.name}!`, 'success')
      } else {
        const user = await register(form.name, form.email, form.password)
        addToast(`Welcome to StockYard, ${user.name}! Account created.`, 'success')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-200/80 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Building2 size={20} />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">StockYard</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">Enterprise Warehouse Management</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-ink-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-ink-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </nav>

      {/* Main Hero & Authentication Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 justify-center">
        {/* Left Column: Product Presentation & Features */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
            <Store size={14} />
            <span>Multi-Tenant Warehouse Architecture</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Isolated Warehouse Databases for Every Store
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Create an organization for each store or warehouse facility. Keep products, storage bays, and inventory movements fully isolated, and invite team members with secure organization codes.
          </p>

          {/* Feature Highlights Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-ink-900/60 border border-slate-200/80 dark:border-ink-800 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <Store size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">Store-by-Store Isolation</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Store A and Store B maintain 100% separate inventory databases and storage bays.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-ink-900/60 border border-slate-200/80 dark:border-ink-800 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">Organization Invite Codes</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Store creators generate unique shareable codes so staff can join with one click.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-ink-900/60 border border-slate-200/80 dark:border-ink-800 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">Role-Based Team Control</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Control permissions with Admin, Manager, and Read-Only Viewer levels.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-ink-900/60 border border-slate-200/80 dark:border-ink-800 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100">Multi-Bay Storage Tracking</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ambient, Refrigerated, and Deep Frozen bays monitored for capacity.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Professional Sign In / Sign Up Card */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl shadow-xl p-6 sm:p-8 relative">
            {/* Tabs for Login vs Register */}
            <div className="flex bg-slate-100 dark:bg-ink-800 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-ink-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-ink-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus size={15} />
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign In to StockYard' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Access your warehouse management dashboard'
                  : 'Sign up to create a warehouse or join an existing organization'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <TextField
                  label="Full Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maria Winters"
                />
              )}

              <TextField
                label="Email Address"
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
              />

              <TextField
                label="Password"
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              />

              {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full justify-center py-2.5 text-sm"
                icon={mode === 'login' ? LogIn : UserPlus}
                disabled={loading}
              >
                {loading
                  ? 'Authenticating…'
                  : mode === 'login'
                    ? 'Sign In'
                    : 'Create Account & Continue'}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-ink-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>StockYard Warehouse &amp; Supermarket Inventory System &bull; Multi-Tenant Operations Platform</p>
      </footer>
    </div>
  )
}
