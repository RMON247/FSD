import { Mail, Phone, CalendarDays } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { EmptyState } from '../ui/States.jsx'
import { formatCurrencyPrecise, formatDate } from '../../utils/format.js'

export default function CustomerViewModal({ open, onClose, customer, onEdit }) {
  if (!customer) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={customer.name}
      subtitle={customer.id}
      footer={<Button onClick={() => { onClose(); onEdit(customer) }}>Edit Customer</Button>}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {customer.email}</span>
          <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {customer.phone}</span>
          <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-slate-400" /> Joined {formatDate(customer.joinedOn)}</span>
          <Badge>{customer.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 dark:bg-ink-900 p-3 text-center">
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{formatCurrencyPrecise(customer.totalPurchases)}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total Purchases</p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-ink-900 p-3 text-center">
            <p className="text-lg font-display font-bold text-slate-800 dark:text-white tabular">{customer.orderCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total Orders</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Purchase History</p>
          {customer.purchaseHistory.length === 0 ? (
            <EmptyState title="No purchases yet" message="Orders will appear here once this customer makes a purchase." />
          ) : (
            <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1.5">
              {customer.purchaseHistory.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-ink-900 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">{order.product}</p>
                    <p className="text-xs text-slate-400">{order.id} &middot; {formatDate(order.date)} &middot; Qty {order.quantity}</p>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 tabular">{formatCurrencyPrecise(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
