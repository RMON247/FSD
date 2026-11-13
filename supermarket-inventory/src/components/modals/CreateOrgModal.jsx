import { useState } from 'react'
import { Building2, Plus, Sparkles, MapPin, FileText, CheckSquare, Square } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField } from '../ui/Field.jsx'
import { useOrg } from '../../context/OrgContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function CreateOrgModal({ open, onClose }) {
  const { createOrg } = useOrg()
  const { addToast } = useToast()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [initSampleBays, setInitSampleBays] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!name.trim()) {
      setError('Please provide a warehouse / store name.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await createOrg({
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        initSampleBays
      })
      setName('')
      setLocation('')
      setDescription('')
      setInitSampleBays(false)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Organization & Warehouse"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set up a clean, isolated warehouse database for your store or facility. You will be assigned as Administrator with a shareable invite code for your staff.
        </p>

        <TextField
          label="Organization / Store Name"
          required
          placeholder="e.g. Beyblades Store, Downtown Supermarket"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Facility Location"
          placeholder="e.g. Building B, Bay 4, Ulhasnagar"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Warehouse Description (Optional)
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl border border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            placeholder="e.g. Main retail store stockroom and fulfillment depot."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="pt-1">
          <label
            onClick={() => setInitSampleBays((v) => !v)}
            className="flex items-start gap-2.5 cursor-pointer text-xs select-none p-2.5 rounded-xl border border-slate-200 dark:border-ink-700 hover:bg-slate-50 dark:hover:bg-ink-800/60 transition-colors"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={initSampleBays}
              onChange={(e) => setInitSampleBays(e.target.checked)}
            />
            {initSampleBays ? (
              <CheckSquare size={16} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            ) : (
              <Square size={16} className="text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 block">Pre-configure starter storage bays</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Automatically add 3 starter bays (Ambient, Cold Room, Deep Freeze). Leave unchecked to start with a completely empty warehouse.
              </span>
            </div>
          </label>
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
          <Button icon={Plus} type="submit" disabled={loading}>
            {loading ? 'Creating Warehouse…' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
