import Storage from '../models/Storage.js'

export async function listStorage(req, res, next) {
  try {
    const locations = await Storage.find().sort({ name: 1 })
    res.json({ count: locations.length, locations })
  } catch (err) {
    next(err)
  }
}

export async function getStorage(req, res, next) {
  try {
    const location = await Storage.findById(req.params.id)
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })
    res.json({ location })
  } catch (err) {
    next(err)
  }
}

export async function createStorage(req, res, next) {
  try {
    const location = await Storage.create(req.body)
    req.app.locals.broadcast?.({ type: 'storage:created', payload: location })
    res.status(201).json({ location })
  } catch (err) {
    next(err)
  }
}

export async function updateStorage(req, res, next) {
  try {
    const location = await Storage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })
    req.app.locals.broadcast?.({ type: 'storage:updated', payload: location })
    res.json({ location })
  } catch (err) {
    next(err)
  }
}

export async function deleteStorage(req, res, next) {
  try {
    const location = await Storage.findByIdAndDelete(req.params.id)
    if (!location) return res.status(404).json({ message: 'Storage location not found.' })
    req.app.locals.broadcast?.({ type: 'storage:deleted', payload: { id: location._id } })
    res.json({ message: 'Storage location deleted.' })
  } catch (err) {
    next(err)
  }
}
