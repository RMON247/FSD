import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Warehouse, Boxes, ShoppingBasket, Users, ArrowLeftRight,
  BarChart3, Settings, PackageCheck, X, Radio
} from 'lucide-react'
import { useRealtime } from '../../context/RealtimeContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/storage', label: 'Storage', icon: Warehouse },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/products', label: 'Products', icon: ShoppingBasket },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { connected, secondsAgo } = useRealtime()

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 text-slate-300 flex flex-col z-50 transition-transform duration-200 shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <PackageCheck size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-[15px] leading-tight">StockYard</p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide">WAREHOUSE OPS</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative
                ${isActive
                  ? 'bg-brand-500/15 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
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

        <div className="p-3 m-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
            <Radio size={12} className={connected ? 'text-teal-400' : 'text-slate-500'} />
            Central Warehouse #04
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {connected ? 'Live sync connected' : 'Live sync offline — showing local data'} &middot; last update {secondsAgo}s ago
          </p>
        </div>
      </aside>
    </>
  )
}
