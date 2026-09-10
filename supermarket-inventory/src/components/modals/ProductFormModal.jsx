import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { TextField, SelectField } from '../ui/Field.jsx'
import { useData } from '../../context/DataContext.jsx'

const emptyForm = {
  name: '', sku: '', category: '', supplierId: '', price: '', unit: 'each',
  quantity: '', minStock: '', storageId: ''
}

export default function ProductFormModal({ open, onClose, onSubmit, initialData }) {
  const { categories, suppliers, storageLocations } = useData()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        name: initialData.name,
        sku: initialData.sku,
        category: initialData.category,
        supplierId: initialData.supplierId,
        price: initialData.price,
        unit: initialData.unit,
        quantity: initialData.quantity,
        minStock: initialData.minStock,
        storageId: initialData.storageId
      } : { ...emptyForm, category: categories[0], supplierId: suppliers[0].id, storageId: storageLocations[0]?.id || '' })
      setErrors({})
    }
  }, [open, initialData, categories, suppliers, storageLocations])

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price'
    if (form.quantity === '' || Number(form.quantity) < 0) errs.quantity = 'Enter a valid quantity'
    if (form.minStock === '' || Number(form.minStock) < 0) errs.minStock = 'Enter a minimum stock level'
    if (!form.storageId) errs.storageId = 'Choose a storage location'
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
      size="lg"
      title={initialData ? 'Edit Product' : 'Add New Product'}
      subtitle={initialData ? `Editing ${initialData.sku}` : 'Add a product to your catalog and inventory'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Product'}</Button>
        </>
      )}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Product Name" required className="sm:col-span-2"
            placeholder="e.g. Vine-Ripened Tomatoes"
            value={form.name} error={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="SKU / Product ID"
            placeholder="Auto-generated if left blank"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
          <SelectField
            label="Category" required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>
          <SelectField
            label="Supplier" required
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          >
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectField>
          <SelectField
            label="Storage Location" required error={errors.storageId}
            value={form.storageId}
            onChange={(e) => setForm({ ...form, storageId: e.target.value })}
          >
            <option value="">Select location…</option>
            {storageLocations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectField>
          <TextField
            label="Unit of Measure"
            placeholder="e.g. kg, each, bag"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <TextField
            label="Price (per unit)" required type="number" step="0.01" min="0"
            value={form.price} error={errors.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <TextField
            label="Current Quantity" required type="number" min="0"
            value={form.quantity} error={errors.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <TextField
            label="Minimum Stock Level" required type="number" min="0"
            value={form.minStock} error={errors.minStock}
            onChange={(e) => setForm({ ...form, minStock: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  )
}
