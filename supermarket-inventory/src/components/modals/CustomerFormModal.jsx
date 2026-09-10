import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField, SelectField } from '../ui/Field.jsx'

const emptyForm = { name: '', email: '', phone: '', status: 'Active' }

export default function CustomerFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        name: initialData.name, email: initialData.email, phone: initialData.phone, status: initialData.status
      } : emptyForm)
      setErrors({})
    }
  }, [open, initialData])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Customer name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
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
      title={initialData ? 'Edit Customer' : 'Add New Customer'}
      subtitle={initialData ? `Editing ${initialData.id}` : 'Register a new customer profile'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Customer'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <TextField
          label="Full Name" required placeholder="e.g. Amara Osei"
          value={form.name} error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          label="Email Address" required type="email" placeholder="name@mail.com"
          value={form.email} error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Phone Number" required placeholder="+1 (555) 000-0000"
          value={form.phone} error={errors.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="Active">Active</option>
          <option value="VIP">VIP</option>
          <option value="Inactive">Inactive</option>
        </SelectField>
      </div>
    </Modal>
  )
}
