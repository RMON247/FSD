import { AlertTriangle } from 'lucide-react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title="" >
      <div className="flex flex-col items-center text-center gap-3 -mt-2">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tone === 'danger' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
          <AlertTriangle size={22} />
        </div>
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-base">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="flex items-center gap-2.5 mt-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} className="flex-1" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}
