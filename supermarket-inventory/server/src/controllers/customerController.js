import Customer from '../models/Customer.js'

export async function listCustomers(req, res, next) {
  try {
    const customers = await Customer.find().sort({ name: 1 })
    res.json({ count: customers.length, customers })
  } catch (err) {
    next(err)
  }
}

export async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })
    res.json({ customer })
  } catch (err) {
    next(err)
  }
}

export async function createCustomer(req, res, next) {
  try {
    const customer = await Customer.create(req.body)
    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:created',
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
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:updated',
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
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'customer:deleted',
      payload: { id: customer._id, name: customer.name },
      actor,
      clientId
    })
    res.json({ message: 'Customer deleted.' })
  } catch (err) {
    next(err)
  }
}
