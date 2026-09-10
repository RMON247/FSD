import { useState } from 'react'
import { Search, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Table, { Td } from '../components/ui/Table.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import { EmptyState } from '../components/ui/States.jsx'
import { SelectField } from '../components/ui/Field.jsx'
import { useTableControls } from '../utils/useTableControls.js'
import { formatDateTime } from '../utils/format.js'

const COLUMNS = [
  { key: 'id', label: 'Transaction', sortable: true },
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'quantity', label: 'Quantity', sortable: true, className: 'text-right' },
  { key: 'reason', label: 'Reason', sortable: false },
  { key: 'user', label: 'User', sortable: true },
  { key: 'date', label: 'Date & Time', sortable: true }
]

export default function Transactions() {
  const { transactions, storageLocations } = useData()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) || t.sku?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || t.type === typeFilter
    const matchesLocation = locationFilter === 'All' || t.storageId === locationFilter
    return matchesSearch && matchesType && matchesLocation
  })

  const { page, setPage, totalPages, sortKey, sortDir, onSort, paged, totalItems } = useTableControls(filtered, { pageSize: 10, initialSortKey: 'date', initialSortDir: 'desc' })

  const stockInCount = transactions.filter((t) => t.type === 'Stock In').length
  const stockOutCount = transactions.filter((t) => t.type === 'Stock Out').length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center"><ArrowLeftRight size={18} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Transactions</p>
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{transactions.length.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center"><ArrowDownRight size={18} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stock In Events</p>
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{stockInCount.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"><ArrowUpRight size={18} /></div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stock Out Events</p>
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{stockOutCount.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <Card padded={false} className="pt-5">
        <div className="px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="relative w-full lg:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full sm:w-40">
              <option value="All">All Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
            </SelectField>
            <SelectField value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full sm:w-48">
              <option value="All">All Locations</option>
              {storageLocations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </SelectField>
          </div>
        </div>

        <div className="px-5">
          {paged.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="No transactions found" message="Try adjusting your search or filters." />
          ) : (
            <>
              <Table
                columns={COLUMNS}
                data={paged}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
                renderRow={(t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-ink-700/40 transition-colors">
                    <Td><span className="font-mono text-xs">{t.id}</span></Td>
                    <Td>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{t.productName}</p>
                      <p className="text-xs text-slate-400 font-mono">{t.sku}</p>
                    </Td>
                    <Td><Badge>{t.type}</Badge></Td>
                    <Td className={`text-right tabular font-semibold ${t.type === 'Stock In' ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {t.type === 'Stock In' ? '+' : '-'}{t.quantity}
                    </Td>
                    <Td>{t.reason}</Td>
                    <Td>{t.user}</Td>
                    <Td className="whitespace-nowrap text-xs">{formatDateTime(t.date)}</Td>
                  </tr>
                )}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} pageSize={10} />
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
