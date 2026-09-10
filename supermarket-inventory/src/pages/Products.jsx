import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Eye, ShoppingBasket, PackagePlus } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Table, { Td } from '../components/ui/Table.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ProductFormModal from '../components/modals/ProductFormModal.jsx'
import StockAdjustModal from '../components/modals/StockAdjustModal.jsx'
import { SelectField } from '../components/ui/Field.jsx'
import { useTableControls } from '../utils/useTableControls.js'
import { formatCurrencyPrecise } from '../utils/format.js'

const COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price', sortable: true, className: 'text-right' },
  { key: 'quantity', label: 'Quantity', sortable: true, className: 'text-right' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: '' }
]

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustStock, storageLocations } = useData()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [stockProduct, setStockProduct] = useState(null)

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const { page, setPage, totalPages, sortKey, sortDir, onSort, paged, totalItems } = useTableControls(filtered, { pageSize: 8, initialSortKey: 'name' })

  const handleSubmit = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data)
      addToast(`${data.name} updated successfully`)
    } else {
      addProduct(data)
      addToast(`${data.name} added to catalog`)
    }
    setEditingProduct(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id)
      addToast(`${deleteTarget.name} deleted`, 'info')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKU…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <SelectField
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
        </div>
        <Button icon={Plus} onClick={() => { setEditingProduct(null); setFormOpen(true) }}>Add Product</Button>
      </div>

      <Card padded={false} className="pt-5">
        <div className="px-5">
          {paged.length === 0 && (
            <EmptyState
              icon={ShoppingBasket}
              title="No products found"
              message={search || categoryFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Add your first product to start tracking inventory.'}
              action={!search && categoryFilter === 'All' && <Button icon={Plus} onClick={() => setFormOpen(true)}>Add Product</Button>}
            />
          )}
        </div>
        {paged.length > 0 && (
          <div className="px-5">
            <Table
              columns={COLUMNS}
              data={paged}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              renderRow={(p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-ink-700/40 transition-colors">
                  <Td>
                    <Link to={`/products/${p.id}`} className="font-medium text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400">{p.name}</Link>
                    <p className="text-xs text-slate-400">{storageLocations.find((s) => s.id === p.storageId)?.name || '—'}</p>
                  </Td>
                  <Td><span className="font-mono text-xs">{p.sku}</span></Td>
                  <Td>{p.category}</Td>
                  <Td className="text-right tabular">{formatCurrencyPrecise(p.price)}</Td>
                  <Td className="text-right tabular">{p.quantity} {p.unit}</Td>
                  <Td><Badge>{p.status}</Badge></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="secondary" icon={PackagePlus} onClick={() => setStockProduct(p)} title="Adjust stock" />
                      <Link to={`/products/${p.id}`}>
                        <Button size="sm" variant="secondary" icon={Eye} title="View" />
                      </Link>
                      <Button size="sm" variant="secondary" icon={Pencil} onClick={() => { setEditingProduct(p); setFormOpen(true) }} title="Edit" />
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget(p)} title="Delete" />
                    </div>
                  </Td>
                </tr>
              )}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} pageSize={8} />
          </div>
        )}
      </Card>

      <ProductFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null) }}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />

      <StockAdjustModal
        open={!!stockProduct}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSubmit={(id, dir, qty, reason) => {
          adjustStock(id, dir, qty, reason)
          addToast(`${dir === 'in' ? 'Added' : 'Removed'} ${qty} ${stockProduct.unit} ${dir === 'in' ? 'to' : 'from'} ${stockProduct.name}`)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        message={`This will permanently remove ${deleteTarget?.name} from your catalog and inventory records.`}
        confirmLabel="Delete Product"
      />
    </div>
  )
}
