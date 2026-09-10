import { PackageSearch, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react'

export function EmptyState({ icon: Icon = PackageSearch, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-ink-700 flex items-center justify-center text-slate-400 mb-3">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {message && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Loading({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 text-slate-400 ${full ? 'py-24' : 'py-10'}`}>
      <Loader2 size={22} className="animate-spin text-brand-500" />
      <p className="text-xs">{label}</p>
    </div>
  )
}

const TOAST_STYLES = {
  success: { icon: CheckCircle2, cls: 'bg-teal-600' },
  error: { icon: XCircle, cls: 'bg-rose-600' },
  info: { icon: Info, cls: 'bg-brand-600' }
}

export function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => {
        const { icon: Icon, cls } = TOAST_STYLES[t.type] || TOAST_STYLES.info
        return (
          <div key={t.id} className={`flex items-center gap-2.5 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-slide-in ${cls}`}>
            <Icon size={16} />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}
