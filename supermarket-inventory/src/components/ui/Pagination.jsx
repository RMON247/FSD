import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  const pages = []
  const maxButtons = 5
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2))
  let endPage = Math.min(totalPages, startPage + maxButtons - 1)
  if (endPage - startPage + 1 < maxButtons) startPage = Math.max(1, endPage - maxButtons + 1)
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between pt-4 mt-1 border-t border-slate-100 dark:border-ink-700 flex-wrap gap-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-700 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={15} />
        </button>
        {startPage > 1 && <span className="text-xs text-slate-400 px-1">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 min-w-7 px-1.5 rounded-md text-xs font-medium ${p === page ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ink-700'}`}
          >
            {p}
          </button>
        ))}
        {endPage < totalPages && <span className="text-xs text-slate-400 px-1">…</span>}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-ink-700 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
