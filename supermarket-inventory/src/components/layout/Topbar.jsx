import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Sun, Moon, Bell, ChevronDown, LogOut, UserCircle, Settings as SettingsIcon, Wifi, WifiOff } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { useRealtime } from '../../context/RealtimeContext.jsx'

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: "Here's what's happening in your warehouse today." },
  '/storage': { title: 'Storage Management', subtitle: 'Monitor and manage warehouse storage areas.' },
  '/inventory': { title: 'Inventory', subtitle: 'Track stock levels across every location.' },
  '/products': { title: 'Products', subtitle: 'Manage your full product catalog.' },
  '/customers': { title: 'Customers', subtitle: 'View customer profiles and purchase activity.' },
  '/transactions': { title: 'Transactions', subtitle: 'Every stock movement, logged and traceable.' },
  '/reports': { title: 'Reports', subtitle: 'Insights into stock, value, and movement trends.' },
  '/settings': { title: 'Settings', subtitle: 'Configure your workspace preferences.' }
}

export default function Topbar({ onMenuClick, pathname }) {
  const { theme, toggleTheme } = useTheme()
  const { products } = useData()
  const { connected } = useRealtime()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const searchRef = useRef(null)
  const profileRef = useRef(null)

  const meta = PAGE_META[pathname] || PAGE_META['/']

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const results = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-ink-900/90 backdrop-blur border-b border-slate-200 dark:border-ink-700 flex items-center gap-4 px-4 lg:px-6 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-slate-500 dark:text-slate-400">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <h1 className="font-display font-semibold text-slate-900 dark:text-white text-[15px] leading-tight">{meta.title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{meta.subtitle}</p>
      </div>

      <div className="flex-1 flex justify-end lg:justify-center">
        <div ref={searchRef} className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
            placeholder="Search products, SKUs…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-ink-800 border border-transparent focus:border-brand-400 focus:bg-white dark:focus:bg-ink-900 text-sm placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          {showResults && query.trim() && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl shadow-panel dark:shadow-panel-dark overflow-hidden animate-fade-in">
              {results.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 py-3">No products match “{query}”.</p>
              ) : (
                results.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-ink-700 text-sm">
                    <div>
                      <p className="text-slate-700 dark:text-slate-200 font-medium">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.sku} · {p.category}</p>
                    </div>
                    <span className="text-xs text-slate-400 tabular">{p.quantity} {p.unit}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          title={connected ? 'Live sync connected to backend' : 'Backend offline — working from local data'}
          className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg ${connected ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400'}`}
        >
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
          {connected ? 'Live' : 'Offline'}
        </span>
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-700 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-700 transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <div ref={profileRef} className="relative pl-1.5 ml-1 border-l border-slate-200 dark:border-ink-700">
          <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              MW
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">Maria Winters</p>
              <p className="text-[10px] text-slate-400 leading-tight">Warehouse Manager</p>
            </div>
            <ChevronDown size={14} className="hidden md:block text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl shadow-panel dark:shadow-panel-dark overflow-hidden animate-fade-in py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-ink-700">
                <UserCircle size={15} /> My Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-ink-700">
                <SettingsIcon size={15} /> Settings
              </button>
              <div className="h-px bg-slate-100 dark:bg-ink-700 my-1" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
