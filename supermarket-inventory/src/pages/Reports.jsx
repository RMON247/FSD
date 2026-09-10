import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileDown } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import StockTrendChart from '../components/charts/StockTrendChart.jsx'
import CategoryValueChart from '../components/charts/CategoryValueChart.jsx'
import { stockTrend, categoryBreakdown } from '../data/dummyData.js'
import { formatCurrencyPrecise, formatDate } from '../utils/format.js'
import { useToast } from '../context/ToastContext.jsx'

export default function Reports() {
  const { products, transactions } = useData()
  const { addToast } = useToast()

  const lowStock = products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock')
    .sort((a, b) => (a.quantity / (a.minStock || 1)) - (b.quantity / (b.minStock || 1)))

  const mostStocked = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5)
  const leastStocked = [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 5)

  const totalValue = products.reduce((sum, p) => sum + p.value, 0)
  const last30 = transactions.filter((t) => (Date.now() - new Date(t.date).getTime()) / 86400000 <= 30)
  const stockInQty = last30.filter((t) => t.type === 'Stock In').reduce((s, t) => s + t.quantity, 0)
  const stockOutQty = last30.filter((t) => t.type === 'Stock Out').reduce((s, t) => s + t.quantity, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">Snapshot generated {formatDate(new Date().toISOString())}</p>
        <Button variant="secondary" icon={FileDown} onClick={() => addToast('Export queued — connect a backend to enable downloads', 'info')}>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Inventory Value</p>
          <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1.5 tabular">{formatCurrencyPrecise(totalValue)}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1"><TrendingUp size={12} /> +6.1% vs last month</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Units Received (30d)</p>
          <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1.5 tabular">{stockInQty.toLocaleString()}</p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Across {last30.filter((t) => t.type === 'Stock In').length} events</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Units Shipped (30d)</p>
          <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1.5 tabular">{stockOutQty.toLocaleString()}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1"><TrendingDown size={12} /> Across {last30.filter((t) => t.type === 'Stock Out').length} events</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 dark:text-slate-400">Products Needing Reorder</p>
          <p className="text-xl font-display font-bold text-slate-900 dark:text-white mt-1.5 tabular">{lowStock.length}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"><AlertTriangle size={12} /> Review recommended</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Stock Movement Trend" subtitle="Units received vs. shipped, last 6 months" />
          <StockTrendChart data={stockTrend} />
        </Card>
        <Card>
          <CardHeader title="Inventory Value by Category" icon={DollarSign} />
          <CategoryValueChart data={categoryBreakdown} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Most Stocked Products" subtitle="Highest quantity on hand" />
          <div className="space-y-1">
            {mostStocked.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100 dark:border-ink-700">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md bg-slate-100 dark:bg-ink-700 text-xs font-semibold text-slate-500 dark:text-slate-300 flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular text-slate-700 dark:text-slate-200">{p.quantity} {p.unit}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Least Stocked Products" subtitle="Lowest quantity on hand" />
          <div className="space-y-1">
            {leastStocked.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-100 dark:border-ink-700">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-md bg-slate-100 dark:bg-ink-700 text-xs font-semibold text-slate-500 dark:text-slate-300 flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                </div>
                <Badge>{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false} className="pt-5">
        <div className="px-5">
          <CardHeader title="Low Stock & Reorder Report" subtitle="Products at or below minimum stock threshold" />
        </div>
        {lowStock.length === 0 ? (
          <EmptyState title="Nothing to reorder" message="All products are currently above their minimum stock threshold." />
        ) : (
          <div className="overflow-x-auto scrollbar-thin px-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-ink-600 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="text-left font-medium py-2.5">Product</th>
                  <th className="text-left font-medium py-2.5">Category</th>
                  <th className="text-right font-medium py-2.5">On Hand</th>
                  <th className="text-right font-medium py-2.5">Min. Level</th>
                  <th className="text-right font-medium py-2.5">Suggested Reorder</th>
                  <th className="text-left font-medium py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-100">{p.name}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{p.category}</td>
                    <td className="py-2.5 text-right tabular">{p.quantity} {p.unit}</td>
                    <td className="py-2.5 text-right tabular text-slate-400">{p.minStock} {p.unit}</td>
                    <td className="py-2.5 text-right tabular font-medium text-brand-600 dark:text-brand-400">{Math.max(p.minStock * 2 - p.quantity, p.minStock)} {p.unit}</td>
                    <td className="py-2.5"><Badge>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
