const baseInput = 'w-full rounded-lg border bg-white dark:bg-ink-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-ink-800'

function borderClass(error) {
  return error ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-ink-600'
}

export function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="text-xs text-rose-500 mt-1">{children}</p>
}

export function TextField({ label, required, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <input className={`${baseInput} ${borderClass(error)}`} {...props} />
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function SelectField({ label, required, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <select className={`${baseInput} ${borderClass(error)}`} {...props}>
        {children}
      </select>
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function TextAreaField({ label, required, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <textarea className={`${baseInput} ${borderClass(error)} resize-none`} rows={3} {...props} />
      <FieldError>{error}</FieldError>
    </div>
  )
}
