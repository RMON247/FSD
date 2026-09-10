const TONES = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400'
}

const STATUS_TONE = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
  Active: 'success',
  Inactive: 'neutral',
  VIP: 'info',
  'Near Capacity': 'warning',
  Full: 'danger',
  'Stock In': 'success',
  'Stock Out': 'warning',
  Refrigerated: 'info',
  Frozen: 'info',
  Ambient: 'neutral',
  Staging: 'teal'
}

export default function Badge({ children, tone }) {
  const resolvedTone = tone || STATUS_TONE[children] || 'neutral'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONES[resolvedTone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}
