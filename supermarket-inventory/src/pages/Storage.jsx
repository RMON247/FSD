import { useState } from 'react'
import { Plus, Warehouse, Eye, Pencil, Trash2, Search } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import StorageFormModal from '../components/modals/StorageFormModal.jsx'
import StorageViewModal from '../components/modals/StorageViewModal.jsx'

export default function Storage() {
  const { storageLocations, addStorage, updateStorage, deleteStorage, products } = useData()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStorage, setEditingStorage] = useState(null)
  const [viewingStorage, setViewingStorage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = storageLocations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (data) => {
    if (editingStorage) {
      updateStorage(editingStorage.id, data)
      addToast(`${data.name} updated successfully`)
    } else {
      addStorage(data)
      addToast(`${data.name} added to warehouse network`)
    }
    setEditingStorage(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteStorage(deleteTarget.id)
      addToast(`${deleteTarget.name} removed`, 'info')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search storage locations…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <Button icon={Plus} onClick={() => { setEditingStorage(null); setFormOpen(true) }}>Add Storage Location</Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Warehouse}
            title="No storage locations found"
            message={search ? `No results for "${search}".` : 'Add your first warehouse storage area to get started.'}
            action={!search && <Button icon={Plus} onClick={() => setFormOpen(true)}>Add Storage Location</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const available = Math.max(0, s.capacity - s.used)
            const usagePct = Math.min(100, Math.round((s.used / s.capacity) * 100))
            const barColor = usagePct >= 95 ? 'bg-rose-500' : usagePct >= 80 ? 'bg-amber-500' : 'bg-teal-500'
            const productCount = products.filter((p) => p.storageId === s.id).length

            return (
              <Card key={s.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <Warehouse size={19} />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-slate-900 dark:text-white text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.id}</p>
                    </div>
                  </div>
                  <Badge>{s.status}</Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{s.location} &middot; {productCount} product{productCount !== 1 ? 's' : ''} &middot; {s.type}</p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Usage</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 tabular">{s.used.toLocaleString()}/{s.capacity.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-ink-700 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${usagePct}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{available.toLocaleString()} units available</p>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-ink-700">
                    <Button size="sm" variant="secondary" icon={Eye} className="flex-1" onClick={() => setViewingStorage(s)}>View</Button>
                    <Button size="sm" variant="secondary" icon={Pencil} onClick={() => { setEditingStorage(s); setFormOpen(true) }} />
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget(s)} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <StorageFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingStorage(null) }}
        onSubmit={handleSubmit}
        initialData={editingStorage}
      />

      <StorageViewModal
        open={!!viewingStorage}
        onClose={() => setViewingStorage(null)}
        storage={viewingStorage}
        productsInStorage={viewingStorage ? products.filter((p) => p.storageId === viewingStorage.id) : []}
        onEdit={(s) => { setEditingStorage(s); setFormOpen(true) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete storage location?"
        message={`This will permanently remove ${deleteTarget?.name} from your warehouse network. This action cannot be undone.`}
        confirmLabel="Delete Location"
      />
    </div>
  )
}
