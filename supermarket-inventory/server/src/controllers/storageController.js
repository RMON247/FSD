import Storage from '../models/Storage.js'

export async function listStorage(req, res, next) {
  try {
    const locations = await Storage.find({ organizationId: req.organizationId }).sort({ name: 1 })
    res.json({ count: locations.length, locations })
  } catch (err) {
    next(err)
  }
}

export async function getStorage(req, res, next) {
  try {
    const location = await Storage.findOne({ _id: req.params.id, organizationId: req.organizationId })
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })
    res.json({ location })
  } catch (err) {
    next(err)
  }
}

export async function createStorage(req, res, next) {
  try {
    const location = await Storage.create({ ...req.body, organizationId: req.organizationId })
    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'storage:created',
      organizationId: req.organizationId.toString(),
      payload: location,
      actor,
      clientId
    })
    res.status(201).json({ location })
  } catch (err) {
    next(err)
  }
}

export async function updateStorage(req, res, next) {
  try {
    const payload = { ...req.body }
    delete payload.organizationId

    const location = await Storage.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      payload,
      { new: true, runValidators: true }
    )
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'storage:updated',
      organizationId: req.organizationId.toString(),
      payload: location,
      actor,
      clientId
    })
    res.json({ location })
  } catch (err) {
    next(err)
  }
}

export async function deleteStorage(req, res, next) {
  try {
    const location = await Storage.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId })
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })

    const clientId = req.headers['x-client-id']
    const actor = req.user?.name || 'A team member'

    req.app.locals.broadcast?.({
      type: 'storage:deleted',
      organizationId: req.organizationId.toString(),
      payload: { id: location._id, name: location.name },
      actor,
      clientId
    })
    res.json({ message: 'Storage location deleted.' })
  } catch (err) {
    next(err)
  }
}
