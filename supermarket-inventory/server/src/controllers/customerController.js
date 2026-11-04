import Customer from '../models/Customer.js'

export async function listCustomers(req, res, next) {
  try {
    const customers = await Customer.find({ organizationId: req.organizationId }).sort({ name: 1 })
    res.json({ count: customers.length, customers })
  } catch (err) {
    next(err)
  }
}

export async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, organizationId: req.organizationId })
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })
    res.json({ customer })
  } catch (err) {
    next(err)
  }
}

export async function createCustomer(req, res, next) {
  try {
    const customer = await Customer.create({ ...req.body, organizationId: req.organizationId })
    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:created',
      organizationId: req.organizationId.toString(),
      payload: customer,
      actor,
      clientId
    })
    res.status(201).json({ customer })
  } catch (err) {
    next(err)
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const payload = { ...req.body }
    delete payload.organizationId

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      payload,
      { new: true, runValidators: true }
    )
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:updated',
      organizationId: req.organizationId.toString(),
      payload: customer,
      actor,
      clientId
    })
    res.json({ customer })
  } catch (err) {
    next(err)
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId })
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:deleted',
      organizationId: req.organizationId.toString(),
      payload: { id: customer._id, name: customer.name },
      actor,
      clientId
    })
    res.json({ message: 'Customer deleted.' })
  } catch (err) {
    next(err)
  }
}
