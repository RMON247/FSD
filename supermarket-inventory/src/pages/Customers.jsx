import { useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Table, { Td } from '../components/ui/Table.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import CustomerFormModal from '../components/modals/CustomerFormModal.jsx'
import CustomerViewModal from '../components/modals/CustomerViewModal.jsx'
import { useTableControls } from '../utils/useTableControls.js'
import { formatCurrencyPrecise } from '../utils/format.js'

const COLUMNS = [
  { key: 'name', label: 'Customer', sortable: true },
  { key: 'email', label: 'Contact', sortable: false },
  { key: 'orderCount', label: 'Orders', sortable: true, className: 'text-right' },
  { key: 'totalPurchases', label: 'Total Spent', sortable: true, className: 'text-right' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '' }
]

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const { page, setPage, totalPages, sortKey, sortDir, onSort, paged, totalItems } = useTableControls(filtered, { pageSize: 8, initialSortKey: 'name' })

  const handleSubmit = (data) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data)
      addToast(`${data.name} updated successfully`)
    } else {
      addCustomer(data)
      addToast(`${data.name} added as a new customer`)
    }
    setEditingCustomer(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id)
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
            placeholder="Search customers…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <Button icon={Plus} onClick={() => { setEditingCustomer(null); setFormOpen(true) }}>Add Customer</Button>
      </div>

      <Card padded={false} className="pt-5">
        <div className="px-5">
          {paged.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              message={search ? `No results for "${search}".` : 'Add your first customer to begin tracking purchases.'}
              action={!search && <Button icon={Plus} onClick={() => setFormOpen(true)}>Add Customer</Button>}
            />
          ) : (
            <>
              <Table
                columns={COLUMNS}
                data={paged}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
                renderRow={(c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-ink-700/40 transition-colors">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{c.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{c.id}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <p className="text-slate-600 dark:text-slate-300">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </Td>
                    <Td className="text-right tabular">{c.orderCount}</Td>
                    <Td className="text-right tabular font-medium">{formatCurrencyPrecise(c.totalPurchases)}</Td>
                    <Td><Badge>{c.status}</Badge></Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="secondary" icon={Eye} onClick={() => setViewingCustomer(c)} />
                        <Button size="sm" variant="secondary" icon={Pencil} onClick={() => { setEditingCustomer(c); setFormOpen(true) }} />
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget(c)} />
                      </div>
                    </Td>
                  </tr>
                )}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} pageSize={8} />
            </>
          )}
        </div>
      </Card>

      <CustomerFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingCustomer(null) }}
        onSubmit={handleSubmit}
        initialData={editingCustomer}
      />

      <CustomerViewModal
        open={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
        onEdit={(c) => { setEditingCustomer(c); setFormOpen(true) }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete customer?"
        message={`This will permanently remove ${deleteTarget?.name} and their purchase history.`}
        confirmLabel="Delete Customer"
      />
    </div>
  )
}
