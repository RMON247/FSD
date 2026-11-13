import { useState, useRef, useEffect } from 'react'
import {
  Menu, Search, Sun, Moon, Bell, ChevronDown, LogOut, UserCircle,
  Building2, Plus, KeyRound, Copy, Check, Store, CheckCircle2
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import CreateOrgModal from '../modals/CreateOrgModal.jsx'
import JoinOrgModal from '../modals/JoinOrgModal.jsx'

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: "Overview of your warehouse stock and performance." },
  '/storage': { title: 'Storage Management', subtitle: 'Monitor warehouse bays, capacity, and temperature zones.' },
  '/inventory': { title: 'Inventory Control', subtitle: 'Track stock levels and reorder thresholds across locations.' },
  '/products': { title: 'Products Catalog', subtitle: 'Manage product items, SKUs, and pricing.' },
  '/customers': { title: 'Customers', subtitle: 'View customer accounts and purchase histories.' },
  '/transactions': { title: 'Transactions', subtitle: 'Audit log of stock movements, receipts, and shipments.' },
  '/reports': { title: 'Analytics & Reports', subtitle: 'Warehouse insights, stock valuation, and movement trends.' },
  '/settings': { title: 'Settings', subtitle: 'Organization settings and team permissions.' }
}

export default function Topbar({ onMenuClick, pathname }) {
  const { theme, toggleTheme } = useTheme()
  const { products } = useData()
  const { user, logout } = useAuth()
  const { organizations, activeOrg, activeOrgId, switchOrg, userOrgRole } = useOrg()
  const { addToast } = useToast()

  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [orgOpen, setOrgOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  const searchRef = useRef(null)
  const profileRef = useRef(null)
  const orgRef = useRef(null)

  const meta = PAGE_META[pathname] || PAGE_META['/']

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (orgRef.current && !orgRef.current.contains(e.target)) setOrgOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const results = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?'

  const handleCopyCode = (e) => {
    e?.stopPropagation()
    if (!activeOrg?.code) return
    navigator.clipboard.writeText(activeOrg.code)
    setCopied(true)
    addToast(`Invite code ${activeOrg.code} copied! Share with staff to let them join.`, 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-ink-900/90 backdrop-blur border-b border-slate-200 dark:border-ink-700 flex items-center gap-3 px-4 lg:px-6 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden text-slate-500 dark:text-slate-400">
        <Menu size={22} />
      </button>

      {/* Organization Switcher Dropdown */}
      <div ref={orgRef} className="relative">
        <button
          onClick={() => setOrgOpen((o) => !o)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-ink-700 bg-slate-50/80 dark:bg-ink-800/80 hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors text-left"
          title="Switch Organization / Warehouse"
        >
          <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Store size={15} />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight max-w-[140px] truncate">
              {activeOrg?.name || 'Select Warehouse'}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {userOrgRole === 'admin' ? 'Admin' : userOrgRole === 'manager' ? 'Manager' : 'Staff'}
            </p>
          </div>
          <ChevronDown size={13} className="text-slate-400 shrink-0" />
        </button>

        {orgOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl shadow-xl z-50 py-2 animate-fade-in">
            <div className="px-3.5 pb-2 border-b border-slate-100 dark:border-ink-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Warehouse Databases
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-ink-700/60">
              {organizations.map((org) => {
                const isSelected = org.id === activeOrgId || org._id === activeOrgId
                return (
                  <button
                    key={org.id || org._id}
                    onClick={() => { switchOrg(org.id || org._id); setOrgOpen(false) }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-ink-700 transition-colors ${
                      isSelected ? 'bg-brand-50/60 dark:bg-brand-500/10 font-semibold' : ''
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className={`truncate ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {org.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Code: {org.code}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-brand-600 dark:text-brand-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-slate-100 dark:border-ink-700 px-2 space-y-1">
              <button
                onClick={() => { setOrgOpen(false); setCreateModalOpen(true) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
              >
                <Plus size={14} /> Create New Warehouse
              </button>
              <button
                onClick={() => { setOrgOpen(false); setJoinModalOpen(true) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors"
              >
                <KeyRound size={14} /> Join with Invite Code
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shareable Invite Code Pill */}
      {activeOrg?.code && (
        <button
          onClick={handleCopyCode}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ink-800 transition-all font-mono"
          title="Click to copy invite code and share with team"
        >
          <span className="text-slate-400 text-[10px] uppercase font-sans font-medium">Org Code:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400">{activeOrg.code}</span>
          {copied ? (
            <Check size={13} className="text-emerald-500 ml-0.5" />
          ) : (
            <Copy size={13} className="text-slate-400 ml-0.5" />
          )}
        </button>
      )}

      {/* Page Title in Large Screens */}
      <div className="hidden xl:block ml-2 border-l border-slate-200 dark:border-ink-700 pl-4">
        <h1 className="font-display font-semibold text-slate-900 dark:text-white text-sm leading-tight">{meta.title}</h1>
        <p className="text-[11px] text-slate-400 leading-tight">{meta.subtitle}</p>
      </div>

      {/* Search Input */}
      <div className="flex-1 flex justify-end">
        <div ref={searchRef} className="relative w-full max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
            placeholder="Search items, SKUs…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-ink-800 border border-transparent focus:border-brand-400 focus:bg-white dark:focus:bg-ink-900 text-xs placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          {showResults && query.trim() && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl shadow-panel dark:shadow-panel-dark overflow-hidden animate-fade-in z-50">
              {results.length === 0 ? (
                <p className="text-xs text-slate-400 px-4 py-3">No products match &ldquo;{query}&rdquo;.</p>
              ) : (
                results.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-ink-700 text-xs">
                    <div>
                      <p className="text-slate-700 dark:text-slate-200 font-medium">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.sku} · {p.category}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular">{p.quantity} {p.unit}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Icons & Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-700 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div ref={profileRef} className="relative pl-1.5 ml-1 border-l border-slate-200 dark:border-ink-700">
          <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-1.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight capitalize">{user?.email}</p>
            </div>
            <ChevronDown size={14} className="hidden md:block text-slate-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl shadow-panel dark:shadow-panel-dark overflow-hidden animate-fade-in py-1 z-50">
              <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{user?.name}</span>
                <span className="text-[11px] text-slate-400 truncate block">{user?.email}</span>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 px-1.5 py-0.5 rounded uppercase">
                  {userOrgRole}
                </span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-ink-700 my-1" />
              <button
                onClick={() => { logout(); setProfileOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateOrgModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <JoinOrgModal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </header>
  )
}
