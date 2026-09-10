import { Link } from 'react-router-dom'
import {
  Boxes, DollarSign, AlertTriangle, XCircle, Users, PackageCheck,
  ArrowUpRight, ArrowDownRight, ArrowRight
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Card, { CardHeader } from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import StockTrendChart from '../components/charts/StockTrendChart.jsx'
import CategoryValueChart from '../components/charts/CategoryValueChart.jsx'
import { stockTrend, categoryBreakdown } from '../data/dummyData.js'
import { formatCurrency, timeAgo } from '../utils/format.js'

export default function Dashboard() {
  const { products, customers, transactions } = useData()

  const totalProducts = products.length
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalValue = products.reduce((sum, p) => sum + p.value, 0)
  const lowStock = products.filter((p) => p.status === 'Low Stock')
  const outOfStock = products.filter((p) => p.status === 'Out of Stock')

  const recentTransactions = transactions.slice(0, 6)
  const attentionProducts = [...lowStock, ...outOfStock].slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard label="Total Products" value={totalProducts.toLocaleString()} icon={Boxes} accent="brand" trend={4.2} trendLabel="vs last month" />
        <StatCard label="Inventory Units" value={totalQuantity.toLocaleString()} icon={PackageCheck} accent="teal" trend={2.8} trendLabel="vs last month" />
        <StatCard label="Inventory Value" value={formatCurrency(totalValue)} icon={DollarSign} accent="brand" trend={6.1} trendLabel="vs last month" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} accent="amber" trend={-3.4} trendLabel="vs last month" />
        <StatCard label="Out of Stock" value={outOfStock.length} icon={XCircle} accent="rose" trend={-1.2} trendLabel="vs last month" />
        <StatCard label="Customers" value={customers.length} icon={Users} accent="slate" trend={5.6} trendLabel="vs last month" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Stock Movement" subtitle="Units received vs. units shipped, last 6 months" />
          <StockTrendChart data={stockTrend} />
        </Card>
        <Card>
          <CardHeader title="Value by Category" subtitle="Current inventory valuation" />
          <CategoryValueChart data={categoryBreakdown} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card padded={false} className="pt-5">
          <div className="px-5">
            <CardHeader
              title="Recent Stock Activity"
              subtitle="Latest inventory movements"
              action={<Link to="/transactions" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>}
            />
          </div>
          {recentTransactions.length === 0 ? (
            <EmptyState title="No recent activity" message="Stock movements will appear here as they happen." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-ink-700">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === 'Stock In' ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                      {t.type === 'Stock In' ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{t.productName}</p>
                      <p className="text-xs text-slate-400">{t.reason} &middot; {timeAgo(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-sm font-semibold tabular ${t.type === 'Stock In' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {t.type === 'Stock In' ? '+' : '-'}{t.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padded={false} className="pt-5">
          <div className="px-5">
            <CardHeader
              title="Needs Attention"
              subtitle="Low stock and out-of-stock products"
              action={<Link to="/inventory" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>}
            />
          </div>
          {attentionProducts.length === 0 ? (
            <EmptyState title="All stocked up" message="No products currently need restocking." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-ink-700">
              {attentionProducts.map((p) => (
                <Link to={`/products/${p.id}`} key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-ink-700/40 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku} &middot; {p.category}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3 flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular">{p.quantity}/{p.minStock} min</span>
                    <Badge>{p.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
