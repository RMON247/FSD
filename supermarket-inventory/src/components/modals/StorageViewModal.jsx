import Modal from '../ui/Modal.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

export default function StorageViewModal({ open, onClose, storage, productsInStorage, onEdit }) {
  if (!storage) return null
  const available = Math.max(0, storage.capacity - storage.used)
  const usagePct = Math.min(100, Math.round((storage.used / storage.capacity) * 100))

  const barColor = usagePct >= 95 ? 'bg-rose-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-teal-500'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={storage.name}
      subtitle={`${storage.id} · ${storage.location}`}
      footer={<Button onClick={() => { onClose(); onEdit(storage) }}>Edit Location</Button>}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{storage.status}</Badge>
          <Badge tone="neutral">{storage.type}</Badge>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Capacity used</span>
            <span className="font-medium text-slate-700 dark:text-slate-200 tabular">{storage.used.toLocaleString()} / {storage.capacity.toLocaleString()} units ({usagePct}%)</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-ink-700 overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 dark:bg-ink-900 p-3 text-center">
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{storage.capacity.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total Capacity</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-ink-900 p-3 text-center">
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{storage.used.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Current Usage</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-ink-900 p-3 text-center">
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{available.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Available Space</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Products stored here ({productsInStorage.length})</p>
          {productsInStorage.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No products currently assigned to this location.</p>
          ) : (
            <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1.5">
              {productsInStorage.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-ink-900 rounded-md px-3 py-2">
                  <span className="text-slate-600 dark:text-slate-300">{p.name}</span>
                  <span className="text-slate-400 tabular">{p.quantity} {p.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
