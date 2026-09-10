export default function Card({ children, className = '', padded = true, as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`bg-white dark:bg-ink-800 border border-slate-200/80 dark:border-ink-600/60 rounded-xl shadow-panel dark:shadow-panel-dark ${padded ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Icon size={18} strokeWidth={2.25} />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-[15px]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
