import Card from './Card.jsx'

const ACCENTS = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-ink-700 dark:text-slate-300'
}

export default function StatCard({ label, value, icon: Icon, accent = 'brand', trend, trendLabel }) {
  const isPositive = typeof trend === 'number' && trend >= 0
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900 dark:text-white tabular">{value}</p>
          {typeof trend === 'number' && (
            <p className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <span>{isPositive ? '▲' : '▼'} {Math.abs(trend)}%</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">{trendLabel}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${ACCENTS[accent]}`}>
            <Icon size={19} strokeWidth={2.25} />
          </div>
        )}
      </div>
    </Card>
  )
}
