import { useState } from 'react'
import { Building2, Plus, KeyRound, LogOut, Shield, ArrowRight, Layers, Warehouse, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useOrg } from '../context/OrgContext.jsx'
import Button from '../components/ui/Button.jsx'
import CreateOrgModal from '../components/modals/CreateOrgModal.jsx'
import JoinOrgModal from '../components/modals/JoinOrgModal.jsx'

export default function WarehouseSetup() {
  const { user, logout } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl px-5 py-2.5 shadow-sm mb-4">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25">
              <Building2 size={20} />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight block">StockYard</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">Enterprise Warehouse Management</span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome, {user?.name || 'Partner'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            To start managing stock, create a new warehouse database or join an existing organization using an administrator invite code.
          </p>
        </div>

        {/* 2 Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {/* Create Organization Card */}
          <div className="bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <Store size={24} />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Create New Warehouse
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Set up a completely isolated database for your store or distribution center. You become the Organization Administrator and can invite team members via code.
              </p>
            </div>

            <div className="mt-6">
              <Button
                className="w-full justify-center"
                icon={Plus}
                onClick={() => setCreateOpen(true)}
              >
                Create Warehouse Database
              </Button>
            </div>
          </div>

          {/* Join Organization Card */}
          <div className="bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <KeyRound size={24} />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Join with Invite Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Joining an existing store or facility? Enter the 6-8 character organization code provided by your administrator to immediately access their warehouse.
              </p>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                className="w-full justify-center"
                icon={ArrowRight}
                onClick={() => setJoinOpen(true)}
              >
                Enter Organization Code
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info & Sign Out */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
          <span>Signed in as <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong></span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium hover:underline"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinOrgModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  )
}
