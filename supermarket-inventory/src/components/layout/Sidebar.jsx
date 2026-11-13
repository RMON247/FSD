import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Warehouse, Boxes, ShoppingBasket, Users, ArrowLeftRight,
  BarChart3, Settings, PackageCheck, X, Copy, Check, Building2
} from 'lucide-react'
import { useState } from 'react'
import { useOrg } from '../../context/OrgContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/storage', label: 'Storage Bays', icon: Warehouse },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/products', label: 'Products', icon: ShoppingBasket },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings & Team', icon: Settings }
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { activeOrg, userOrgRole } = useOrg()
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    if (!activeOrg?.code) return
    navigator.clipboard.writeText(activeOrg.code)
    setCopied(true)
    addToast(`Invite code ${activeOrg.code} copied! Share with your staff.`, 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 text-slate-300 flex flex-col z-50 transition-transform duration-200 shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <PackageCheck size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-[15px] leading-tight">StockYard</p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide">WAREHOUSE SYSTEM</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Management</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative
                ${isActive ? 'bg-brand-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-400" />}
                  <item.icon size={17} strokeWidth={2.25} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Active Warehouse Footnote with Invite Code */}
        {activeOrg && (
          <div className="p-3 m-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <Building2 size={13} className="text-brand-400 shrink-0" />
                <span className="truncate">{activeOrg.name}</span>
              </p>
            </div>
            <p className="text-[10px] text-slate-400 truncate mb-2">
              {activeOrg.location || 'Warehouse Facility'} &bull; <span className="capitalize">{userOrgRole}</span>
            </p>

            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/20 hover:bg-black/35 text-[11px] font-mono text-slate-300 transition-colors"
              title="Copy organization invite code"
            >
              <span className="text-slate-400 text-[10px] uppercase font-sans">Invite:</span>
              <span className="font-bold text-white tracking-wider">{activeOrg.code}</span>
              {copied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} className="text-slate-400" />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
