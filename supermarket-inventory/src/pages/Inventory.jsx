import { useState } from 'react'
import { Search, PackagePlus, AlertTriangle, Boxes, DollarSign, PackageX, ClipboardList, ListPlus } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ReorderCartProvider, useReorderCart } from '../context/ReorderCartContext.jsx'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Table, { Td } from '../components/ui/Table.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import { SelectField } from '../components/ui/Field.jsx'
import StockAdjustModal from '../components/modals/StockAdjustModal.jsx'
import ReorderListModal from '../components/modals/ReorderListModal.jsx'
import { useTableControls } from '../utils/useTableControls.js'
import { formatCurrencyPrecise } from '../utils/format.js'

const COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'quantity', label: 'Qty on Hand', sortable: true, className: 'text-right' },
  { key: 'minStock', label: 'Min. Level', sortable: true, className: 'text-right' },
  { key: 'storageId', label: 'Location', sortable: true },
  { key: 'value', label: 'Value', sortable: true, className: 'text-right' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '' }
]

const STATUS_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock']

function InventoryContent() {
  const { products, storageLocations, categories, adjustStock } = useData()
  const { addToast } = useToast()
  const { items: reorderItems, addItem, count } = useReorderCart()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [stockProduct, setStockProduct] = useState(null)
  const [reorderOpen, setReorderOpen] = useState(false)

  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length
  const totalValue = products.reduce((sum, p) => sum + p.value, 0)

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter
    const matchesLocation = locationFilter === 'All' || p.storageId === locationFilter
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation
  })

  const { page, setPage, totalPages, sortKey, sortDir, onSort, paged, totalItems } = useTableControls(filtered, { pageSize: 8, initialSortKey: 'quantity', initialSortDir: 'asc' })

  const isInReorder = (id) => reorderItems.some((i) => i.id === id)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Inventory Value" value={formatCurrencyPrecise(totalValue)} icon={DollarSign} accent="brand" />
        <StatCard label="Low Stock Items" value={lowStockCount} icon={AlertTriangle} accent="amber" />
        <StatCard label="Out of Stock Items" value={outOfStockCount} icon={PackageX} accent="rose" />
      </div>

      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="flex items-start sm:items-center justify-between gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 flex-col sm:flex-row">
          <div className="flex items-start gap-3">
            <AlertTriangle size={17} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-medium">{lowStockCount + outOfStockCount} product{lowStockCount + outOfStockCount !== 1 ? 's' : ''}</span> need attention —
              {' '}{lowStockCount} running low and {outOfStockCount} completely out of stock.
            </p>
          </div>
          <Button size="sm" variant="secondary" icon={ClipboardList} onClick={() => setReorderOpen(true)} className="shrink-0">
            Reorder List {count > 0 && `(${count})`}
          </Button>
        </div>
      )}

      <Card padded={false} className="pt-5">
        <div className="px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="relative w-full lg:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <SelectField value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-44">
              <option value="All">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </SelectField>
            <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectField>
            <SelectField value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full sm:w-44">
              <option value="All">All Locations</option>
              {storageLocations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </SelectField>
            {lowStockCount + outOfStockCount === 0 && (
              <Button size="md" variant="secondary" icon={ClipboardList} onClick={() => setReorderOpen(true)}>
                Reorder List {count > 0 && `(${count})`}
              </Button>
            )}
          </div>
        </div>

        <div className="px-5">
          {paged.length === 0 ? (
            <EmptyState icon={Boxes} title="No matching inventory" message="Try adjusting your search or filters." />
          ) : (
            <>
              <Table
                columns={COLUMNS}
                data={paged}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
                renderRow={(p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/70 dark:hover:bg-ink-700/40 transition-colors ${p.status === 'Out of Stock' ? 'bg-rose-50/40 dark:bg-rose-500/[0.03]' : ''}`}>
                    <Td><span className="font-medium text-slate-800 dark:text-slate-100">{p.name}</span></Td>
                    <Td><span className="font-mono text-xs">{p.sku}</span></Td>
                    <Td>{p.category}</Td>
                    <Td className="text-right tabular font-medium">{p.quantity} {p.unit}</Td>
                    <Td className="text-right tabular text-slate-400">{p.minStock} {p.unit}</Td>
                    <Td>{storageLocations.find((s) => s.id === p.storageId)?.name || '—'}</Td>
                    <Td className="text-right tabular">{formatCurrencyPrecise(p.value)}</Td>
                    <Td><Badge>{p.status}</Badge></Td>
                    <Td>
                      <div className="flex justify-end gap-1.5">
                        {p.status !== 'In Stock' && (
                          <Button
                            size="sm" variant="secondary" icon={ListPlus}
                            disabled={isInReorder(p.id)}
                            onClick={() => { addItem({ id: p.id, name: p.name, unit: p.unit, suggested: Math.max(p.minStock * 2 - p.quantity, p.minStock) }); addToast(`${p.name} added to reorder list`) }}
                            title="Add to reorder list"
                          />
                        )}
                        <Button size="sm" variant="secondary" icon={PackagePlus} onClick={() => setStockProduct(p)}>Adjust</Button>
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

      <StockAdjustModal
        open={!!stockProduct}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSubmit={(id, dir, qty, reason) => {
          adjustStock(id, dir, qty, reason)
          addToast(`${dir === 'in' ? 'Added' : 'Removed'} ${qty} ${stockProduct.unit} ${dir === 'in' ? 'to' : 'from'} ${stockProduct.name}`)
        }}
      />

      <ReorderListModal open={reorderOpen} onClose={() => setReorderOpen(false)} />
    </div>
  )
}

export default function Inventory() {
  return (
    <ReorderCartProvider>
      <InventoryContent />
    </ReorderCartProvider>
  )
}
