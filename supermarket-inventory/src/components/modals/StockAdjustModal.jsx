import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField, SelectField, Label } from '../ui/Field.jsx'

const REASONS = {
  in: ['Purchase Order Received', 'Supplier Restock', 'Returned to Inventory', 'Inter-warehouse Transfer In'],
  out: ['Store Replenishment', 'Customer Order Fulfilled', 'Damaged / Expired', 'Inter-warehouse Transfer Out']
}

export default function StockAdjustModal({ open, onClose, product, onSubmit }) {
  const [direction, setDirection] = useState('in')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState(REASONS.in[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setDirection('in')
      setQuantity('')
      setReason(REASONS.in[0])
      setError('')
    }
  }, [open, product])

  if (!product) return null

  const handleDirectionChange = (dir) => {
    setDirection(dir)
    setReason(REASONS[dir][0])
  }

  const handleSubmit = () => {
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than zero')
      return
    }
    if (direction === 'out' && qty > product.quantity) {
      setError(`Only ${product.quantity} ${product.unit} available to remove`)
      return
    }
    onSubmit(product.id, direction, qty, reason)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      subtitle={`${product.name} · ${product.sku}`}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={direction === 'in' ? 'success' : 'primary'} onClick={handleSubmit}>
            {direction === 'in' ? 'Confirm Stock In' : 'Confirm Stock Out'}
          </Button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-50 dark:bg-ink-900 rounded-lg p-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current quantity on hand</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-white tabular">{product.quantity} {product.unit}</span>
        </div>

        <div>
          <Label>Movement Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDirectionChange('in')}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${direction === 'in' ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400' : 'border-slate-200 dark:border-ink-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-ink-700'}`}
            >
              <ArrowDownRight size={15} /> Stock In
            </button>
            <button
              onClick={() => handleDirectionChange('out')}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${direction === 'out' ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'border-slate-200 dark:border-ink-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-ink-700'}`}
            >
              <ArrowUpRight size={15} /> Stock Out
            </button>
          </div>
        </div>

        <TextField
          label={`Quantity (${product.unit})`} required type="number" min="1"
          value={quantity} error={error}
          onChange={(e) => { setQuantity(e.target.value); setError('') }}
          placeholder="0"
        />

        <SelectField label="Reason / Reference" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS[direction].map((r) => <option key={r} value={r}>{r}</option>)}
        </SelectField>
      </div>
    </Modal>
  )
}
