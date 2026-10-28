import { useEffect, useState } from 'react'
import { ShieldAlert, Clock, CheckCircle2, RefreshCw, LogOut, Wifi, Sparkles, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useRealtime } from '../context/RealtimeContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Button from '../components/ui/Button.jsx'

export default function PendingVerification() {
  const { user, refreshUser, logout } = useAuth()
  const { connected } = useRealtime()
  const { addToast } = useToast()
  const [checking, setChecking] = useState(false)

  // Poll or auto-refresh every 10 seconds in case WebSocket was momentarily disconnected
  useEffect(() => {
    const timer = setInterval(async () => {
      await refreshUser()
    }, 10000)
    return () => clearInterval(timer)
  }, [refreshUser])

  const handleManualCheck = async () => {
    setChecking(true)
    try {
      const freshUser = await refreshUser()
      if (freshUser?.isVerified) {
        addToast('Congratulations! Your account has been verified by an administrator.', 'success')
      } else {
        addToast('Your account is still awaiting administrator approval.', 'info')
      }
    } catch {
      addToast('Could not verify status. Make sure the backend server is reachable.', 'error')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl px-5 py-2.5 shadow-sm mb-4">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/30">
              <Building2 size={20} />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight block">StockYard</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">Warehouse Management System</span>
            </div>
          </div>
        </div>

        {/* Verification Pending Card */}
        <div className="bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock size={40} className="animate-pulse" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-white dark:bg-ink-900 border-2 border-white dark:border-ink-900 flex items-center justify-center shadow">
                <ShieldAlert size={16} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Account Verification Pending
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Welcome, <span className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</span>. Your account has been registered, but warehouse database access is currently restricted.
            </p>
          </div>

          {/* User Account Snapshot */}
          <div className="bg-slate-50 dark:bg-ink-800/60 rounded-xl p-4 border border-slate-100 dark:border-ink-700/60 mb-6 text-xs space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-ink-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Registered Email:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-ink-700">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Account Status:</span>
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Clock size={12} /> Pending Administrator Approval
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Default Role:</span>
              <span className="text-slate-700 dark:text-slate-300">Viewer (Unverified)</span>
            </div>
          </div>

          {/* Real-time WebSocket Status Banner */}
          <div className="bg-brand-50/60 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl p-3.5 mb-6 text-xs flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0 text-brand-600 dark:text-brand-400">
              <Wifi size={16} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                Real-Time WebSocket Sync Active
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                When an administrator approves your account, your dashboard will automatically unlock instantly without refreshing!
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              icon={RefreshCw}
              onClick={handleManualCheck}
              disabled={checking}
            >
              {checking ? 'Checking Status…' : 'Check Verification Status'}
            </Button>
            <Button
              variant="secondary"
              icon={LogOut}
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Demo Tip for Reviewer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-ink-900/70 border border-slate-200/80 dark:border-ink-800 rounded-xl p-3.5 backdrop-blur">
          <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-brand-500" />
            Testing Tip for Administrators
          </p>
          <p>
            Open an Incognito window or second browser tab, log in as <span className="font-mono font-medium text-slate-700 dark:text-slate-300">admin@stockyard.com</span> / <span className="font-mono font-medium text-slate-700 dark:text-slate-300">Password123</span>, go to <span className="font-semibold">Settings &rarr; Team Access Management</span>, and click <span className="font-semibold text-emerald-600">Verify Account</span>. This screen will unlock instantly!
          </p>
        </div>
      </div>
    </div>
  )
}
