import { Minus, Plus, X, PackageCheck } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { EmptyState } from '../ui/States.jsx'
import { useReorderCart } from '../../context/ReorderCartContext.jsx'
import { useData } from '../../context/DataContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function ReorderListModal({ open, onClose }) {
  const { items, removeItem, setQuantity, clear } = useReorderCart()
  const { adjustStock } = useData()
  const { addToast } = useToast()

  const submit = () => {
    items.forEach((i) => adjustStock(i.id, 'in', i.quantity, 'Batch Reorder'))
    addToast(`Reordered ${items.length} product${items.length !== 1 ? 's' : ''} successfully`)
    clear()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reorder List"
      subtitle="Review quantities, then submit as a batch stock-in"
      footer={items.length > 0 && (
        <>
          <Button variant="secondary" onClick={clear}>Clear List</Button>
          <Button icon={PackageCheck} onClick={submit}>Submit Reorder ({items.length})</Button>
        </>
      )}
    >
      {items.length === 0 ? (
        <EmptyState title="Your reorder list is empty" message="Add low-stock or out-of-stock products from the inventory table." />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-ink-700">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 pr-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{i.name}</p>
                <p className="text-xs text-slate-400">{i.unit}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setQuantity(i.id, i.quantity - 5)} className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-700"><Minus size={14} /></button>
                <input
                  type="number"
                  value={i.quantity}
                  onChange={(e) => setQuantity(i.id, Number(e.target.value) || 1)}
                  className="w-14 text-center text-sm tabular rounded-md border border-slate-200 dark:border-ink-600 bg-white dark:bg-ink-900 py-1"
                />
                <button onClick={() => setQuantity(i.id, i.quantity + 5)} className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-700"><Plus size={14} /></button>
                <button onClick={() => removeItem(i.id)} className="h-7 w-7 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 ml-1"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
