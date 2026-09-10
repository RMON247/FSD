import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export default function Table({ columns, data, sortKey, sortDir, onSort, rowKey = 'id', renderRow, emptyState }) {
  if (!data || data.length === 0) {
    return emptyState || null
  }

  return (
    <div className="overflow-x-auto scrollbar-thin -mx-5 px-5">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-ink-600">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide py-3 px-3 first:pl-1 last:pr-1 ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200' : ''}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortKey === col.key
                      ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                      : <ChevronsUpDown size={13} className="opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-ink-700">
          {data.map((row) => renderRow(row, columns))}
        </tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`py-3 px-3 first:pl-1 last:pr-1 align-middle text-slate-700 dark:text-slate-300 ${className}`}>{children}</td>
}
