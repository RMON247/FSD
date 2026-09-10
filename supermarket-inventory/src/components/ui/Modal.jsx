import { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-ink-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-ink-600 animate-scale-in max-h-[90vh] flex flex-col`}>
        <div className={`flex items-start justify-between px-6 pt-5 pb-4 ${title ? 'border-b border-slate-100 dark:border-ink-700' : ''}`}>
          <div>
            {title && <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-700 dark:hover:text-slate-200 transition-colors ml-auto"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-ink-700 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
