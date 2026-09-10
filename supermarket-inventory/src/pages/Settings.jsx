import { useState } from 'react'
import { Sun, Moon, Monitor, Bell, Building2, ShieldCheck, Save } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { TextField } from '../components/ui/Field.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-ink-600'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { addToast } = useToast()

  const [notifications, setNotifications] = useState({
    lowStock: true,
    outOfStock: true,
    dailySummary: false,
    newCustomers: true
  })

  const [profile, setProfile] = useState({
    name: 'Maria Winters',
    email: 'maria.winters@stockyard.com',
    role: 'Warehouse Manager',
    warehouse: 'Central Warehouse #04'
  })

  const handleSaveProfile = () => addToast('Profile settings saved')
  const handleSaveNotifications = () => addToast('Notification preferences updated')

  return (
    <div className="space-y-5 max-w-3xl">
      <Card>
        <CardHeader title="Appearance" subtitle="Choose how StockYard looks on this device" icon={Sun} />
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'light', label: 'Light', icon: Sun },
            { key: 'dark', label: 'Dark', icon: Moon },
            { key: 'system', label: 'System', icon: Monitor }
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (opt.key === 'system') {
                  setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                } else {
                  setTheme(opt.key)
                }
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-sm font-medium transition-colors ${theme === opt.key ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'border-slate-200 dark:border-ink-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-ink-700'}`}
            >
              <opt.icon size={18} />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Profile" subtitle="Your account information" icon={Building2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <TextField label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <TextField label="Role" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
          <TextField label="Primary Warehouse" value={profile.warehouse} onChange={(e) => setProfile({ ...profile, warehouse: e.target.value })} />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={handleSaveProfile}>Save Profile</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" subtitle="Choose what you want to be alerted about" icon={Bell} />
        <div className="space-y-1">
          {[
            { key: 'lowStock', label: 'Low stock alerts', desc: 'Get notified when products fall below minimum stock level' },
            { key: 'outOfStock', label: 'Out-of-stock alerts', desc: 'Immediate alert when a product quantity reaches zero' },
            { key: 'dailySummary', label: 'Daily summary email', desc: 'A daily digest of inventory and transaction activity' },
            { key: 'newCustomers', label: 'New customer sign-ups', desc: 'Notify when a new customer profile is created' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0 border-slate-100 dark:border-ink-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-ink-700 flex justify-end">
          <Button icon={Save} onClick={handleSaveNotifications}>Save Preferences</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Data & Integrations" subtitle="This build uses local demo data" icon={ShieldCheck} />
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          StockYard is currently running on in-memory sample data so you can explore the full interface. All add,
          edit, delete, and stock-adjustment actions work in this session. Connect a backend API or database to
          persist data permanently — the codebase is structured so each data source (products, storage, customers,
          transactions) can be swapped for real API calls independently.
        </p>
      </Card>
    </div>
  )
}
