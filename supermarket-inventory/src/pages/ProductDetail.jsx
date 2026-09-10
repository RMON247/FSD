import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, PackagePlus, Tag, Warehouse, Truck, Boxes } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ProductFormModal from '../components/modals/ProductFormModal.jsx'
import StockAdjustModal from '../components/modals/StockAdjustModal.jsx'
import { formatCurrencyPrecise, formatDateTime, formatDate } from '../utils/format.js'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, storageLocations, suppliers, transactions, updateProduct, deleteProduct, adjustStock } = useData()
  const { addToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <Card>
        <EmptyState
          icon={Boxes}
          title="Product not found"
          message="This product may have been deleted or the link is incorrect."
          action={<Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/products')}>Back to Products</Button>}
        />
      </Card>
    )
  }

  const storage = storageLocations.find((s) => s.id === product.storageId)
  const supplier = suppliers.find((s) => s.id === product.supplierId)
  const history = transactions.filter((t) => t.productId === product.id).slice(0, 10)

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/products')} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={15} /> Back to Products
      </button>

      <div className="flex flex-col lg:flex-row gap-5">
        <Card className="lg:w-96 shrink-0 h-fit">
          <div className="flex items-start justify-between mb-4">
            <div className="h-14 w-14 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Tag size={24} />
            </div>
            <Badge>{product.status}</Badge>
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{product.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">{product.sku} &middot; {product.id}</p>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-slate-50 dark:bg-ink-900 rounded-lg p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Price / unit</p>
              <p className="text-base font-display font-bold text-slate-800 dark:text-white mt-0.5 tabular">{formatCurrencyPrecise(product.price)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-ink-900 rounded-lg p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Inventory Value</p>
              <p className="text-base font-display font-bold text-slate-800 dark:text-white mt-0.5 tabular">{formatCurrencyPrecise(product.value)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-ink-900 rounded-lg p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Quantity</p>
              <p className="text-base font-display font-bold text-slate-800 dark:text-white mt-0.5 tabular">{product.quantity} {product.unit}</p>
            </div>
            <div className="bg-slate-50 dark:bg-ink-900 rounded-lg p-3">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Min. Stock Level</p>
              <p className="text-base font-display font-bold text-slate-800 dark:text-white mt-0.5 tabular">{product.minStock} {product.unit}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Warehouse size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-700 dark:text-slate-200">{storage?.name || 'Unassigned'}</p>
                <p className="text-xs text-slate-400">{storage?.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-700 dark:text-slate-200">{supplier?.name || 'Unknown supplier'}</p>
                <p className="text-xs text-slate-400">{supplier?.contact}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Boxes size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-slate-700 dark:text-slate-200">{product.category}</p>
                <p className="text-xs text-slate-400">Added {formatDate(product.addedOn)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-ink-700">
            <Button className="flex-1" icon={PackagePlus} onClick={() => setStockOpen(true)}>Adjust Stock</Button>
            <Button variant="secondary" icon={Pencil} onClick={() => setFormOpen(true)} />
            <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)} />
          </div>
        </Card>

        <Card padded={false} className="flex-1 pt-5">
          <div className="px-5">
            <CardHeader title="Movement History" subtitle="Recent stock-in and stock-out activity for this product" />
          </div>
          {history.length === 0 ? (
            <EmptyState title="No movement history" message="Stock adjustments for this product will appear here." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-ink-700">
              {history.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{t.reason}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(t.date)} &middot; {t.user}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular ${t.type === 'Stock In' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {t.type === 'Stock In' ? '+' : '-'}{t.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={(data) => { updateProduct(product.id, data); addToast(`${data.name} updated successfully`) }}
        initialData={product}
      />

      <StockAdjustModal
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        product={product}
        onSubmit={(pid, dir, qty, reason) => {
          adjustStock(pid, dir, qty, reason)
          addToast(`${dir === 'in' ? 'Added' : 'Removed'} ${qty} ${product.unit} ${dir === 'in' ? 'to' : 'from'} ${product.name}`)
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { deleteProduct(product.id); addToast(`${product.name} deleted`, 'info'); navigate('/products') }}
        title="Delete product?"
        message={`This will permanently remove ${product.name} from your catalog and inventory records.`}
        confirmLabel="Delete Product"
      />
    </div>
  )
}
