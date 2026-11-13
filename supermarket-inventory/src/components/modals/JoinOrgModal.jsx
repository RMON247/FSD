import { useState } from 'react'
import { KeyRound, ArrowRight, ShieldCheck } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField } from '../ui/Field.jsx'
import { useOrg } from '../../context/OrgContext.jsx'

export default function JoinOrgModal({ open, onClose }) {
  const { joinOrg } = useOrg()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!code.trim()) {
      setError('Please enter the organization invite code.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await joinOrg(code.trim().toUpperCase())
      setCode('')
      onClose()
    } catch (err) {
      setError(err.message || 'Could not join organization. Please verify the code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join an Existing Organization Warehouse"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter the unique 6-8 digit invite code provided by your store or warehouse administrator to gain access to their inventory.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Organization Invite Code
          </label>
          <div className="relative">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              placeholder="e.g. STK-CENTRAL"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-ink-800 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button icon={ArrowRight} type="submit" disabled={loading}>
            {loading ? 'Verifying & Joining…' : 'Join Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
