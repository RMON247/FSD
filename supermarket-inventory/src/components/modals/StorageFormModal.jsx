import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField, SelectField } from '../ui/Field.jsx'

const STORAGE_TYPES = ['Refrigerated', 'Frozen', 'Ambient', 'Staging']

const emptyForm = { name: '', location: '', type: 'Ambient', capacity: '', used: '' }

export default function StorageFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        name: initialData.name,
        location: initialData.location,
        type: initialData.type,
        capacity: initialData.capacity,
        used: initialData.used
      } : emptyForm)
      setErrors({})
    }
  }, [open, initialData])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Storage name is required'
    if (!form.location.trim()) errs.location = 'Location is required'
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = 'Enter a valid capacity'
    if (form.used === '' || Number(form.used) < 0) errs.used = 'Enter current usage'
    if (Number(form.used) > Number(form.capacity)) errs.used = 'Usage cannot exceed capacity'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(form)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Storage Location' : 'Add Storage Location'}
      subtitle={initialData ? `Editing ${initialData.id}` : 'Register a new warehouse storage area'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Location'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <TextField
          label="Storage Name" required
          placeholder="e.g. Cold Storage A"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Location" required
          placeholder="e.g. Building A, Bay 1"
          value={form.location}
          error={errors.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <SelectField
          label="Storage Type" required
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {STORAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Total Capacity (units)" required type="number" min="0"
            value={form.capacity}
            error={errors.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <TextField
            label="Current Usage (units)" required type="number" min="0"
            value={form.used}
            error={errors.used}
            onChange={(e) => setForm({ ...form, used: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  )
}
